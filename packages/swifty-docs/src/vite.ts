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

/**
 * Vite plugin for @swifty.js/docs.
 *
 * Returns the plugin pair a docs site needs:
 * 1. swifty-docs — compiles .md files into { pageData, contentHtml } modules
 * 2. preact — compiles the Preact theme (and your own .tsx components)
 *
 * Usage:
 * ```ts
 * import { swiftyDocsPlugin } from "@swifty.js/docs/vite";
 *
 * export default defineConfig({
 *   plugins: [swiftyDocsPlugin({ config: docsConfig })],
 * });
 * ```
 */
import fs, { readFileSync } from "node:fs";
import { isAbsolute, resolve, dirname } from "node:path";
import type { DocsConfig } from "./types";
import { compileMarkdown } from "./compile-markdown";
import type { Plugin } from "vite";
import preact from "@preact/preset-vite";
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

// Re-export build-time utilities for use in vite.config
export { defineConfig } from "./define-config";
export { scanDocsDir } from "./scanner";
export { generateSidebar } from "./sidebar-generator";
export type { DocsConfig, SidebarConfig } from "./types";

export interface SwiftyDocsVitePluginOptions {
  /** Full docs config. */
  config: DocsConfig;
  /** Log resolveId/load activity. */
  debug?: boolean;
}

// Suffix used to mark compiled .md files in the module graph
const MD_SUFFIX = "?swifty-docs";

/**
 * Create the Vite plugin array for a docs site:
 * 1. swifty-docs: compiles .md files to JS modules
 * 2. preact (@preact/preset-vite): compiles the Preact theme JSX
 */
export function swiftyDocsPlugin(
  options: SwiftyDocsVitePluginOptions,
): Plugin[] {
  const { config, debug = false } = options;

  const docsPlugin: Plugin = {
    name: "swifty-docs",
    enforce: "pre",

    resolveId(source: string, importer?: string) {
      const [cleanSource, query] = source.split("?");
      if (!cleanSource.endsWith(".md")) return null;
      if (cleanSource.includes("node_modules")) return null;
      // Leave Vite asset-style imports (?raw / ?url / ?inline) untouched.
      if (query && /(^|&)(raw|url|inline)($|&|=)/.test(query)) return null;
      const abs = isAbsolute(cleanSource)
        ? cleanSource
        : importer
          ? resolve(dirname(importer), cleanSource)
          : resolve(process.cwd(), cleanSource);
      const real = abs.startsWith("/@fs") ? abs.slice("/@fs".length) : abs;
      if (debug) {
        console.log(
          `[@swifty.js/docs] resolveId: ${source} -> ${real}${MD_SUFFIX} (importer=${importer ?? "none"})`,
        );
      }
      return real + MD_SUFFIX;
    },

    async load(id: string) {
      const qIdx = id.indexOf("?");
      const query = qIdx >= 0 ? id.slice(qIdx + 1) : "";
      if (!query.split("&").includes("swifty-docs")) return null;

      let filePath = qIdx >= 0 ? id.slice(0, qIdx) : id;

      if (filePath.startsWith("/@fs")) {
        filePath = filePath.slice("/@fs".length);
      }

      if (debug) {
        console.log(`[@swifty.js/docs] load: id=${id} filePath=${filePath}`);
      }

      const source = fs.readFileSync(filePath, "utf-8");

      return await compileMarkdown(source, {
        config,
        filePath,
        debug,
      });
    },
  };

  const baseSyncPlugin: Plugin = {
    name: "swifty-docs:base-sync",
    config(userConfig) {
      if (userConfig.base === undefined && config.baseUrl) {
        return { base: config.baseUrl };
      }
      return null;
    },
  };

  // GitHub Pages (and similar static hosts) serve 404.html for unknown
  // paths. Shipping a copy of index.html restores deep links / refreshes
  // for the history-based SPA router.
  let resolvedOutDir = "";
  const spaFallbackPlugin: Plugin = {
    name: "swifty-docs:spa-fallback",
    apply: "build",
    configResolved(resolved) {
      resolvedOutDir = resolve(resolved.root, resolved.build.outDir);
    },
    closeBundle() {
      const indexHtml = resolve(resolvedOutDir, "index.html");
      const fallbackHtml = resolve(resolvedOutDir, "404.html");
      if (fs.existsSync(indexHtml) && !fs.existsSync(fallbackHtml)) {
        fs.copyFileSync(indexHtml, fallbackHtml);
        if (debug) {
          console.log("[@swifty.js/docs] emitted 404.html SPA fallback");
        }
      }
    },
  };

  return [docsPlugin, baseSyncPlugin, spaFallbackPlugin, ...preact()];
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function isProtectedMarkdown(id: string): string | null {
  if (!id.includes(MD_SUFFIX)) return null;
  const filePath = id.split("?")[0].replace(/^\/@fs/, "");
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
  const fmMatch = raw.match(FRONTMATTER_RE);
  if (!fmMatch || !/^protected:\s*true/m.test(fmMatch[1])) return null;
  return filePath;
}

export function docsGuardPlugin(): Plugin {
  const password = process.env["DOCS_PASSWORD"];
  if (!password) {
    return {
      name: "docs-guard",
      enforce: "post",
      transform(_code, id) {
        const filePath = isProtectedMarkdown(id);
        if (filePath) {
          console.warn(
            `[@swifty.js/docs] ${filePath} has "protected: true" but ` +
              `DOCS_PASSWORD is not set — the page will be published UNENCRYPTED.`,
          );
        }
        return null;
      },
    };
  }

  return {
    name: "docs-guard",
    enforce: "post",

    transform(code, id) {
      const filePath = isProtectedMarkdown(id);
      if (!filePath) return null;

      const htmlMatch = code.match(
        /export const contentHtml = ("(?:[^"\\]|\\.)*");?\s*$/m,
      );
      if (!htmlMatch) {
        this.warn(
          `[@swifty.js/docs] could not locate contentHtml in ${filePath} — ` +
            `page left UNENCRYPTED.`,
        );
        return null;
      }

      const html = JSON.parse(htmlMatch[1]) as string;
      const salt = randomBytes(16);
      const iv = randomBytes(12);
      const key = pbkdf2Sync(password, salt, 100_000, 32, "sha256");
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      const encrypted = Buffer.concat([
        cipher.update(html, "utf-8"),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();

      const payload = JSON.stringify({
        encrypted: encrypted.toString("base64"),
        authTag: authTag.toString("base64"),
        salt: salt.toString("base64"),
        iv: iv.toString("base64"),
      });

      let out = code.replace(
        htmlMatch[0],
        `export const contentHtml = ${JSON.stringify(payload)};\nexport const __protected = true;`,
      );

      // pageData ships in plaintext and feeds the search index; strip the
      // body-derived fields (excerpt/description/headings) so protected
      // content cannot be read through search results. The title stays —
      // it is already visible in the sidebar.
      const pdMatch = out.match(/export const pageData = (\{[\s\S]*?\n\});/);
      if (pdMatch) {
        try {
          const pd = JSON.parse(pdMatch[1]) as Record<string, unknown>;
          pd["description"] = undefined;
          pd["excerpt"] = "";
          pd["headings"] = [];
          out = out.replace(
            pdMatch[0],
            `export const pageData = ${JSON.stringify(pd, null, 2)};`,
          );
        } catch {
          this.warn(
            `[@swifty.js/docs] could not sanitize pageData in ${filePath} — ` +
              `protected excerpt/headings may leak into the search index.`,
          );
        }
      }

      return { code: out, map: null };
    },
  };
}
