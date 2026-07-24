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
 * Vite configuration for @swifty.js/docs.
 *
 * Dual-mode config:
 *   --mode lib   → Library build (5 entries, ESM+CJS+dts)
 *   --mode docs  → Documentation site (Preact app, Vite dev/build)
 *
 * Vite 7 uses Rollup internally, so build.lib is Rollup-based.
 */
import {
  defineConfig,
  type LibraryFormats,
  type PluginOption,
  type UserConfig,
  type Rollup,
} from "vite";
import dts from "vite-plugin-dts";
import { resolve, dirname } from "node:path";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
// !!! For your project, it should be:
// import { swiftyDocsPlugin, docsGuardPlugin } from "@swifty.js/docs/vite";
import { swiftyDocsPlugin, docsGuardPlugin } from "./src/vite";
import { existsSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { VitePWA } from "vite-plugin-pwa";
/** Documentation site configuration used in docs mode. */
import swiftyDocsConfig from "./swifty-docs.config";
import pkg from "./package.json" with { type: "json" };
import { fileURLToPath } from "node:url";

// === Shared constants ===

const PKG_DIR = import.meta.dirname;

/**
 * All deps + peerDeps are externalized in lib mode (users install them).
 * Preact stays external too — consumers must share a single preact
 * runtime instance with the precompiled theme.
 */
const EXTERNAL_IDS = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  "preact",
  "preact/hooks",
  "preact/compat",
];

function isExternal(id: string): boolean {
  if (id.startsWith("node:")) return true;
  return EXTERNAL_IDS.some((e) => id === e || id.startsWith(e + "/"));
}

// === Mode router ===

export default defineConfig(({ mode, command }) => {
  const isDev = command === "serve";
  if (mode === "lib") {
    return libConfig();
  }
  if (mode === "docs") {
    return docsConfig({ isDev });
  }
  return docsConfig({ isDev });
});

// === Library build ===

/**
 * Rollup plugin: copies static assets (ejs, client.d.ts, client.css)
 * from src/ to dist/ after each build, and registers them as watch
 * dependencies so changes trigger a rebuild in --watch mode.
 */
function copyAssetsPlugin(): Rollup.Plugin {
  const ASSETS = ["file-content.ejs", "client.d.ts", "client.css"];

  return {
    name: "copy-static-assets",
    buildStart() {
      for (const file of ASSETS) {
        this.addWatchFile(resolve(PKG_DIR, "src", file));
      }
    },
    writeBundle() {
      const srcDir = resolve(PKG_DIR, "src");
      const distDir = resolve(PKG_DIR, "dist");
      for (const file of ASSETS) {
        const src = resolve(srcDir, file);
        const dest = resolve(distDir, file);
        if (!existsSync(src)) continue;
        if (file === "client.css") {
          // In src/ the @source points at the theme sources; in the published
          // package the utility classes live in the stable theme chunk.
          const css = readFileSync(src, "utf-8").replace(
            '@source "./theme";',
            '@source "./theme-chunk.js";',
          );
          writeFileSync(dest, css, "utf-8");
        } else {
          copyFileSync(src, dest);
        }
      }
    },
  };
}

function libConfig(): UserConfig {
  // All Preact theme modules (the only code containing Tailwind utility
  // classes) are forced into a single stable chunk so consumers can point
  // Tailwind at exactly one file: @source "@swifty.js/docs/theme-chunk.js".
  const themeChunk = (id: string): string | undefined =>
    id.includes("/src/theme/") ? "theme-chunk" : undefined;

  const sharedOutput = {
    exports: "named" as const,
    manualChunks: themeChunk,
  };

  return {
    // Keep the docs-site PWA assets (public/) out of the npm package.
    publicDir: false,
    build: {
      lib: {
        cssFileName: "swifty-docs",
        entry: {
          index: resolve(PKG_DIR, "src/index.ts"),
          compiler: resolve(PKG_DIR, "src/compiler.ts"),
          vite: resolve(PKG_DIR, "src/vite.ts"),
          runtime: resolve(PKG_DIR, "src/runtime.ts"),
          theme: resolve(PKG_DIR, "src/theme/index.ts"),
        },
        formats: ["es", "cjs"] satisfies LibraryFormats[],
        fileName: (format: string, entryName: string) =>
          format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
      },
      rollupOptions: {
        external: isExternal,
        output: [
          {
            ...sharedOutput,
            format: "es",
            entryFileNames: "[name].js",
            chunkFileNames: (chunk) =>
              chunk.name === "theme-chunk"
                ? "theme-chunk.js"
                : "chunks/[name]-[hash].js",
          },
          {
            ...sharedOutput,
            format: "cjs",
            entryFileNames: "[name].cjs",
            chunkFileNames: (chunk) =>
              chunk.name === "theme-chunk"
                ? "theme-chunk.cjs"
                : "chunks/[name]-[hash].cjs",
          },
        ],
      },
      outDir: "dist",
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
    },
    plugins: [
      preact() as PluginOption,
      dts({
        tsconfigPath: "./tsconfig.build.json",
        outDirs: "dist",
      }),
      copyAssetsPlugin() as PluginOption,
    ],
  };
}

// === Documentation site build ===

function docsConfig(options?: { isDev?: boolean }): UserConfig {
  const { isDev = true } = options ?? {};
  return {
    base: isDev ? "/" : "/swifty/",
    root: resolve(PKG_DIR, "app"),
    publicDir: resolve(PKG_DIR, "public"),
    plugins: [
      ...swiftyDocsPlugin({
        config: swiftyDocsConfig,
        debug: true,
      }),
      docsGuardPlugin(),
      tailwindcss() as PluginOption,
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.svg",
          "favicon.ico",
          "apple-touch-icon-180x180.png",
        ],
        manifest: {
          name: "Swifty Docs",
          short_name: "swifty-docs",
          description: "Swifty Docs",
          theme_color: "#f4f8f4",
          background_color: "#f4f8f4",
          display: "standalone",
          scope: isDev ? "/" : "/swifty/",
          start_url: isDev ? "/" : "/swifty/",
          icons: [
            {
              src: "pwa-64x64.png",
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }) as PluginOption,
    ],
    resolve: {
      alias: {
        "@": resolve(dirname(fileURLToPath(new URL(import.meta.url))), "src"),
        "@swifty-docs/generated": resolve(PKG_DIR, ".swifty-docs/generated"),
        "@swifty.js/docs": resolve(PKG_DIR, "src"),
      },
    },
    build: {
      outDir: resolve(PKG_DIR, "dist-docs"),
      emptyOutDir: true,
    },
  };
}
