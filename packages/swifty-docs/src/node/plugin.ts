/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { readFileSync } from "node:fs";
import { relative } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { createMarkdownRenderer } from "vitepress";
import type { MarkdownEnv, MarkdownRenderer, SiteConfig } from "vitepress";
import { encryptContent } from "./encrypt";
import { extractFrontmatter, isPrivate } from "./frontmatter";

export interface PrivateDocsPluginOptions {
  /**
   * Module specifier the generated page stubs import at runtime for the
   * password dialog and decryption. Override to point at a local source
   * checkout (e.g. in this package's own example site).
   */
  clientModule?: string;
  /** Log transform activity. */
  debug?: boolean;
}

const PAGE_DATA_RE = /__pageData\s*=\s*JSON\.parse\("((?:[^"\\]|\\.)*)"\)/;

const LOG_PREFIX = "[@swifty.js/docs]";

function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

/** Resolve a Vite module id to a markdown file path, or null to skip it. */
function parseMdId(id: string): string | null {
  const [path = "", query = ""] = id.split("?", 2);
  if (!path.endsWith(".md")) return null;
  if (path.includes("node_modules")) return null;
  const params = new URLSearchParams(query);
  // Vite asset-style imports and @vitejs/plugin-vue sub-requests
  // (?vue&type=style etc.) must pass through untouched.
  if (params.has("raw") || params.has("url") || params.has("inline") || params.has("vue")) {
    return null;
  }
  return path.startsWith("/@fs") ? path.slice("/@fs".length) : path;
}

/**
 * Recover the pageData object VitePress embedded in the compiled page
 * module (`export const __pageData = JSON.parse("…")`).
 */
function extractPageData(code: string): Record<string, unknown> | null {
  const match = code.match(PAGE_DATA_RE);
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(JSON.parse(`"${match[1]}"`));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to the synthesized fallback.
  }
  return null;
}

/**
 * Body-derived fields must not ship in plaintext: description and headers
 * leak content into the static HTML `<head>` and anything reading pageData.
 * The title stays — it is already visible in sidebars and navigation.
 */
function scrubPageData(pageData: Record<string, unknown>): Record<string, unknown> {
  const scrubbed: Record<string, unknown> = {
    ...pageData,
    description: "",
    headers: [],
  };
  const frontmatter = scrubbed["frontmatter"];
  if (frontmatter && typeof frontmatter === "object" && "description" in frontmatter) {
    scrubbed["frontmatter"] = { ...frontmatter, description: "" };
  }
  return scrubbed;
}

function synthesizePageData(env: MarkdownEnv, relativePath: string): Record<string, unknown> {
  const frontmatter = env.frontmatter ?? {};
  const title =
    typeof frontmatter["title"] === "string" ? frontmatter["title"] : (env.title ?? relativePath);
  return {
    title,
    description: "",
    frontmatter,
    headers: [],
    relativePath,
    filePath: relativePath,
  };
}

export function privateDocsPlugin(options: PrivateDocsPluginOptions = {}): Plugin {
  const { clientModule = "@swifty.js/docs/client", debug = false } = options;
  const password = process.env["DOCS_PASSWORD"];

  let siteConfig: SiteConfig | undefined;
  let mdPromise: Promise<MarkdownRenderer> | undefined;
  const warned = new Set<string>();

  return {
    name: "swifty-docs:private",
    enforce: "post",

    configResolved(config) {
      siteConfig = (config as ResolvedConfig & { vitepress?: SiteConfig }).vitepress;
      if (!siteConfig) {
        console.warn(
          `${LOG_PREFIX} no VitePress site config found on the resolved ` +
            `Vite config — privateDocsPlugin() is a no-op outside VitePress.`,
        );
      }
    },

    async transform(code, id) {
      if (!siteConfig) return null;
      const filePath = parseMdId(id);
      if (!filePath) return null;

      let src: string;
      try {
        src = readFileSync(filePath, "utf-8");
      } catch {
        return null;
      }
      const { data } = extractFrontmatter(src);
      if (!isPrivate(data)) return null;

      if (!password) {
        if (!warned.has(filePath)) {
          warned.add(filePath);
          console.warn(
            `${LOG_PREFIX} ${filePath} has "private: true" but ` +
              `DOCS_PASSWORD is not set — the page will be published UNENCRYPTED.`,
          );
        }
        return null;
      }

      mdPromise ??= createMarkdownRenderer(
        siteConfig.srcDir,
        siteConfig.markdown,
        siteConfig.site.base,
        siteConfig.logger,
      );
      const md = await mdPromise;

      const relativePath = slash(relative(siteConfig.srcDir, filePath));
      const env: MarkdownEnv = {
        path: filePath,
        relativePath,
        cleanUrls: siteConfig.cleanUrls ?? false,
      };
      const html = md.render(src, env);

      const payload = encryptContent(JSON.stringify({ html }), password);
      const pageData = scrubPageData(
        extractPageData(code) ?? synthesizePageData(env, relativePath),
      );

      if (debug) {
        console.log(`${LOG_PREFIX} encrypted ${relativePath}`);
      }

      const stub = `import { h, ref } from "vue";

export const __pageData = JSON.parse(${JSON.stringify(JSON.stringify(pageData))});

const __vpdKey = ${JSON.stringify(relativePath)};
const __vpdPayload = ${JSON.stringify(payload)};
const __vpdTick = ref(0);

// VitePress's SSG bundle runs in plain Node where import.meta.env is not
// defined, so the stub must use a runtime guard. The dynamic import is
// never executed during SSR, which keeps Lit out of the Node runtime.
if (typeof window !== "undefined") {
  import(${JSON.stringify(clientModule)}).then((m) => {
    m.registerPrivatePage(__vpdKey, __vpdPayload, () => {
      __vpdTick.value++;
    });
  }).catch((err) => {
    console.error(${JSON.stringify(`${LOG_PREFIX} failed to load the client runtime`)}, err);
  });
}

export default {
  name: ${JSON.stringify(relativePath)},
  render() {
    // Read the tick so unlocking (which bumps it) re-renders this
    // component; VitePress re-collects the outline in onVnodeUpdated.
    __vpdTick.value;
    return h("vpd-private-page", { "data-key": __vpdKey });
  },
};
`;

      return { code: stub, map: null };
    },
  };
}
