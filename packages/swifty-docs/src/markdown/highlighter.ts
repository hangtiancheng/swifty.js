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
 * Shiki syntax highlighter (lazy-loaded singleton).
 *
 * Shiki uses TextMate grammars via WASM to produce accurate,
 * VSCode-quality syntax highlighting. The output is HTML with inline
 * styles -- no external CSS needed at runtime.
 *
 * The highlighter is expensive to create (WASM + grammar loading),
 * so we lazy-load it on first use and cache the singleton.
 * Subsequent calls to getHighlighter() return instantly.
 */
import type { Highlighter, BundledLanguage } from "shiki";
import { escapeHtml } from "../utils/escape-html";

const DEFAULT_LANGUAGES: BundledLanguage[] = [
  "bash",
  "cjs",
  "css",
  "csv",
  "cts",
  "docker",
  "dockerfile",
  "dotenv",
  "go",
  "graphql",
  "html",
  "http",
  "javascript",
  "js",
  "json",
  "json5",
  "jsonc",
  "jsonl",
  "jsx",
  "less",
  "make",
  "makefile",
  "markdown",
  "md",
  "mdc",
  "mdx",
  "mermaid",
  "mjs",
  "mts",
  "nginx",
  "prisma",
  "proto",
  "protobuf",
  "scss",
  "sql",
  "toml",
  "tsx",
  "typescript",
  "vue",
  "wasm",
  "xml",
  "yaml",
  "yml",
  "zsh",
];

// Cache highlighters by theme+languages so that different configs (e.g. in
// multi-site builds or tests) get correctly-themed highlighters instead of
// sharing the first-created singleton.
const cache = new Map<string, Highlighter>();
const initPromises = new Map<string, Promise<Highlighter>>();

// Single default used by both getHighlighter (loading) and highlightCode
// (rendering). They must agree, or a config with only `darkTheme` set would
// request a light theme that was never loaded and Shiki would throw —
// silently disabling highlighting site-wide via the catch below.
const DEFAULT_THEME = "github-dark";

function resolveLanguages(languages: string[] | undefined): string[] {
  return languages && languages.length > 0 ? languages : DEFAULT_LANGUAGES;
}

function cacheKey(
  theme: string | undefined,
  languages: string[] | undefined,
  darkTheme?: string,
): string {
  const langs = resolveLanguages(languages).slice().sort().join(",");
  return `${theme ?? DEFAULT_THEME}+${darkTheme ?? ""}:${langs}`;
}

/**
 * Get or create the Shiki highlighter for the given theme+languages.
 * Thread-safe: concurrent calls with the same key share the init promise.
 * When `darkTheme` is set, both themes are loaded so codeToHtml can emit
 * dual-theme output (see highlightCode).
 */
export async function getHighlighter(
  theme?: string,
  languages?: string[],
  darkTheme?: string,
): Promise<Highlighter> {
  const key = cacheKey(theme, languages, darkTheme);
  const cached = cache.get(key);
  if (cached) return cached;
  const existing = initPromises.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const { createHighlighter } = await import("shiki");
      const themes = [theme ?? DEFAULT_THEME];
      if (darkTheme && darkTheme !== themes[0]) themes.push(darkTheme);
      const h = await createHighlighter({
        themes,
        langs: resolveLanguages(languages) as BundledLanguage[],
      });
      cache.set(key, h);
      return h;
    } finally {
      // Always drop the init promise: on success the instance lives in
      // `cache`; on failure a retained rejected promise would make every
      // future call fail forever, even after the cause is fixed.
      initPromises.delete(key);
    }
  })();
  initPromises.set(key, promise);
  return promise;
}

/**
 * Highlight a code string. Returns complete `<pre>` HTML.
 *
 * With a single theme the output uses inline colors. With `darkTheme` set,
 * output uses `themes: { light, dark }` with `defaultColor: false` — every
 * token then carries `--shiki-light` / `--shiki-dark` variables and no
 * inline color, letting the theme stylesheet switch schemes under `.dark`.
 * Falls back to escaped plain text on any error.
 */
export function highlightCode(
  hl: Highlighter,
  code: string,
  lang: string,
  theme?: string,
  darkTheme?: string,
): string {
  try {
    const loadedLangs = hl.getLoadedLanguages();
    const safeLang = loadedLangs.includes(lang as BundledLanguage)
      ? lang
      : "text";

    if (darkTheme) {
      return hl.codeToHtml(code, {
        lang: safeLang,
        themes: {
          light: theme ?? DEFAULT_THEME,
          dark: darkTheme,
        },
        defaultColor: false,
      });
    }

    return hl.codeToHtml(code, {
      lang: safeLang,
      theme: theme ?? DEFAULT_THEME,
    });
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}
