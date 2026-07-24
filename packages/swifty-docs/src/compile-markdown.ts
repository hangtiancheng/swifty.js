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
 * Markdown-to-page-module compiler.
 *
 * Transforms a .md source string into a JS module string that the Preact
 * theme consumes at runtime ({ pageData, contentHtml }).
 *
 * Pipeline:
 * 1. Extract YAML frontmatter (js-yaml)
 * 2. Initialize Shiki highlighter (if configured)
 * 3. Parse markdown body to token stream (markdown-it + plugins)
 * 4. Render tokens to HTML string (with syntax-highlighted code blocks)
 * 5. Extract page metadata (title, headings)
 * 6. Wrap HTML in a JS module exporting pageData + contentHtml
 */
import { extractFrontmatter } from "./markdown/frontmatter";
import { createParser } from "./markdown/parser";
import { renderToSwiftyTemplate } from "./markdown/renderer";
import { getHighlighter, highlightCode } from "./markdown/highlighter";
import type { CompileMarkdownOptions } from "./types";
import { deriveTitleFromPath } from "./utils/derive-title";
import {
  extractExcerpt,
  extractFirstHeading,
  extractHeadings,
} from "./utils/heading-extraction";
import { isAbsolute, relative, resolve } from "node:path";

/**
 * Compile a .md file source into a JS module string.
 *
 * The output module exports:
 * - `pageData`: static page metadata (title, description, headings)
 * - `contentHtml`: the rendered HTML string for the content column
 *
 * This function is async because Shiki highlighter initialization
 * requires loading WASM and TextMate grammars on first call.
 * The highlighter is cached as a singleton, so subsequent calls
 * resolve instantly.
 */
export async function compileMarkdown(
  source: string,
  options: CompileMarkdownOptions,
): Promise<string> {
  // 1. Extract frontmatter
  const { data: frontmatter, content } = extractFrontmatter(source);

  // 2. Create parser with user config
  const md = createParser(options.config.markdown);

  // 3. Initialize Shiki highlighter if configured
  if (options.config.highlight) {
    const hl = await getHighlighter(
      options.config.highlight.theme,
      options.config.highlight.languages,
      options.config.highlight.darkTheme,
    );
    const theme = options.config.highlight.theme;
    const darkTheme = options.config.highlight.darkTheme;
    md.options.highlight = (code: string, lang: string) => {
      return highlightCode(hl, code, lang, theme, darkTheme);
    };
  }

  // 4. Parse and render to HTML
  const tokens = md.parse(content, {});
  const htmlBody = renderToSwiftyTemplate(tokens, md);

  // 5. Build page metadata
  // Resolve relativePath via path.relative so absolute filePath inputs
  // (as produced by the Vite loaders) yield the same
  // "guide/config.md" form the scanner produces — the previous
  // startsWith(docsPrefix) check failed for absolute paths.
  const projectRoot = options.projectRoot ?? process.cwd();
  const docsAbsDir = isAbsolute(options.config.docs)
    ? options.config.docs
    : resolve(projectRoot, options.config.docs);
  const relativeFilePath = relative(docsAbsDir, options.filePath).replace(
    /\\/g,
    "/",
  );

  const title =
    (frontmatter["title"] as string) ||
    extractFirstHeading(content) ||
    deriveTitleFromPath(relativeFilePath);

  const headings = extractHeadings(content);

  // Description defaults to the derived title (filename or directory name)
  // when frontmatter description is missing.
  const description =
    (frontmatter["description"] as string) ||
    deriveTitleFromPath(relativeFilePath);

  const excerpt = extractExcerpt(content);

  const pageData = {
    title,
    description,
    excerpt,
    sidebarPosition: frontmatter["sidebar_position"] as number | undefined,
    sidebarLabel: (frontmatter["sidebar_label"] as string) || undefined,
    draft: (frontmatter["draft"] as boolean) || undefined,
    headings,
    relativePath: relativeFilePath,
  };

  // 6. Generate JS module
  return generateModule(htmlBody, pageData, options);
}

function generateModule(
  htmlBody: string,
  pageData: Record<string, unknown>,
  options: CompileMarkdownOptions,
): string {
  const pageDataJson = JSON.stringify(pageData, null, 2);

  // Emit contentHtml as a JSON string literal (double-quoted). JSON.stringify
  // handles all escaping (quotes, newlines, backslashes) safely, so the HTML
  // can be embedded without worrying about template literal interpolation.
  const contentHtmlJson = JSON.stringify(htmlBody);

  return `// Generated by @swifty.js/docs
// Source: ${options.filePath}
export const pageData = ${pageDataJson};

export const contentHtml = ${contentHtmlJson};
`;
}
