/**
 * Vite configuration for @lark.js/docs.
 *
 * Dual-mode config:
 *   --mode lib   → Library build (6 entries, ESM+CJS+dts)
 *   --mode site  → Documentation site (generates routes.ts, Vite dev/build)
 *
 * Vite 7 uses Rollup internally, so build.lib is Rollup-based.
 */
import {
  defineConfig,
  type LibraryFormats,
  type PluginOption,
  type UserConfig,
} from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import { larkMvcPlugin7 } from "@lark.js/mvc/vite";
import tailwindcss from "@tailwindcss/vite";
import { larkDocsPlugin } from "./src/vite";
import type { DocsConfig } from "./src/types";
import { scanDocsDir } from "./src/scanner";
import { generateRouteMap } from "./src/route-map";
import { generateSidebar } from "./src/sidebar-generator";
import { buildSearchIndex } from "./src/search-index";
import path from "node:path";
import fs from "node:fs";
import type { OutputOptions, RenderedChunk } from "rollup";

// === Shared constants ===

const PKG_DIR = import.meta.dirname;

/** All deps + peerDeps are externalized in lib mode (users install them). */
const EXTERNAL_PKGS = [
  "js-yaml",
  "lucide-static",
  "markdown-it",
  "markdown-it-container",
  "shiki",
  "@lark.js/mvc",
  "@tailwindcss/typography",
  "daisyui",
  "tailwindcss",
];

/**
 * __filename / __dirname ESM shims.
 * webpack.ts and rspack.ts use __filename to self-reference as loaders.
 * Injected via Rollup output.banner for ESM chunks only.
 */
const CJS_SHIMS = [
  'import { fileURLToPath as __cjs_fileURLToPath } from "url";',
  'import { dirname as __cjs_dirname } from "path";',
  "const __filename = __cjs_fileURLToPath(import.meta.url);",
  "const __dirname = __cjs_dirname(__filename);",
].join("\n");

/** Docs site configuration used in site mode. */
const docsConfig: DocsConfig = {
  docs: "docs",
  baseUrl: "/docs/",
  routeMode: "history",
  title: "@lark.js/docs",
  description: "Documentation site generator for @lark.js/mvc",
  lang: "en-US",
  nav: [
    { text: "Get Started", link: "/docs/get-started/" },
    { text: "Markdown", link: "/docs/markdown/" },
    { text: "Router", link: "/docs/router/" },
    { text: "Styling", link: "/docs/style/" },
  ],
  sidebar: {
    "/docs/get-started/": "auto",
    "/docs/markdown/": "auto",
    "/docs/router/": "auto",
    "/docs/style/": "auto",
  },
  highlight: {
    theme: "github-dark",
    languages: [
      "typescript",
      "javascript",
      "html",
      "css",
      "json",
      "bash",
      "yaml",
      "markdown",
    ],
  },
  search: { provider: "local" },
};

// === Mode router ===

export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return libConfig();
  }
  // Site mode: generate routes.ts before returning config
  generateRoutesFile(docsConfig);
  return siteConfig();
});

// === Library build ===

function libConfig(): UserConfig {
  return {
    build: {
      lib: {
        entry: {
          index: resolve(PKG_DIR, "src/index.ts"),
          compiler: resolve(PKG_DIR, "src/compiler.ts"),
          vite: resolve(PKG_DIR, "src/vite.ts"),
          webpack: resolve(PKG_DIR, "src/webpack.ts"),
          rspack: resolve(PKG_DIR, "src/rspack.ts"),
          runtime: resolve(PKG_DIR, "src/runtime.ts"),
        },
        formats: ["es", "cjs"] satisfies LibraryFormats[],
        fileName: (format: string, entryName: string) =>
          format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
      },
      rollupOptions: {
        external: (id: string) =>
          EXTERNAL_PKGS.some((e) => id === e || id.startsWith(e + "/")),
        output: {
          banner: (chunk: RenderedChunk) =>
            chunk.format === "es" ? CJS_SHIMS : "",
        } satisfies OutputOptions,
      },
      outDir: "dist",
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
    },
    plugins: [
      dts({
        tsconfigPath: "./tsconfig.build.json",
        outDirs: "dist",
      }),
    ],
  };
}

// === Documentation site build ===

function siteConfig(): UserConfig {
  return {
    root: resolve(PKG_DIR, "docs/app"),
    plugins: [
      larkDocsPlugin({ config: docsConfig }),
      larkMvcPlugin7({
        debug: true,
        virtualDom: true,
        useSwc: true,
      }),
      tailwindcss() as PluginOption,
    ],
    resolve: {
      alias: {
        "@lark.js/docs": resolve(PKG_DIR, "src"),
      },
    },
    build: {
      outDir: resolve(PKG_DIR, "dist-site"),
      emptyOutDir: true,
    },
    server: {
      port: 3200,
      open: true,
    },
  };
}

// === Routes file generator ===

/**
 * Generate a physical `docs/app/routes.ts` file by scanning the docs/ directory.
 *
 * This file is regenerated each time `vite --mode site` starts (dev or build).
 * It imports all .md files (compiled by larkDocPlugin), registers each as a
 * View class, and exports the route map + site data for boot.ts to consume.
 *
 * This replaces the virtual module approach — the generated file is a real
 * TypeScript file that Vite resolves and compiles normally.
 */
function generateRoutesFile(config: DocsConfig): void {
  const docsDir = path.isAbsolute(config.docs)
    ? config.docs
    : resolve(PKG_DIR, config.docs);

  const routes = scanDocsDir(docsDir, config.baseUrl);
  const routeMap = generateRouteMap(routes);

  // Build sidebar
  const sidebar: Record<string, unknown> = {};
  if (config.sidebar) {
    for (const [prefix, sidebarConfig] of Object.entries(config.sidebar)) {
      if (sidebarConfig === "auto") {
        sidebar[prefix] = generateSidebar(routes, prefix, config.baseUrl);
      } else {
        sidebar[prefix] = sidebarConfig;
      }
    }
  }

  // Build search index
  const searchIndex =
    config.search?.provider === "none" ? [] : buildSearchIndex(routes);

  // Generate import statements for each .md file
  // Paths are relative from docs/app/ to the actual .md files
  const appDir = resolve(PKG_DIR, "docs/app");
  const imports = routes
    .map((r, i) => {
      const relPath = path.relative(appDir, r.filePath);
      const importPath = relPath.startsWith(".") ? relPath : `./${relPath}`;
      return `import view${i} from ${JSON.stringify(importPath)};`;
    })
    .join("\n");

  // Generate registerViewClass calls
  const registrations = routes
    .map((r, i) => `registerViewClass(${JSON.stringify(r.viewId)}, view${i});`)
    .join("\n");

  // Compose siteData
  const siteData = {
    title: config.title,
    description: config.description || "",
    lang: config.lang || "en-US",
    nav: config.nav || [],
    sidebar,
    searchIndex,
  };

  const fileContent = `// Auto-generated by vite.config.ts — DO NOT EDIT
// Generated at: ${new Date().toISOString()}

import { registerViewClass } from "@lark.js/mvc";

${imports}

${registrations}

export const routes = ${JSON.stringify(routeMap, null, 2)};

export const siteData = ${JSON.stringify(siteData, null, 2)};
`;

  const outputPath = resolve(appDir, "routes.ts");
  fs.writeFileSync(outputPath, fileContent, "utf-8");
}
