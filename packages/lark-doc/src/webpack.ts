/**
 * Webpack loader and plugin for @lark.js/doc.
 *
 * The loader transforms .md files into JS modules that export lark-mvc Views.
 * The plugin auto-registers the loader rule for .md files.
 *
 * Usage:
 * ```ts
 * import { LarkDocPlugin } from "@lark.js/doc/webpack";
 *
 * export default {
 *   plugins: [new LarkDocPlugin({ config: docConfig })],
 * };
 * ```
 */
import type { DocConfig } from "./types";
import { compileMarkdown } from "./compiler/compile-markdown";

export interface LarkDocWebpackOptions {
  /** Full doc config. */
  config: DocConfig;
  /** Enable debug mode. */
  debug?: boolean;
  /** Test regex. Default: /\.md$/ */
  test?: RegExp;
  /** Exclude regex. Default: /node_modules/ */
  exclude?: RegExp;
}

interface WebpackLoaderContext {
  callback: (err: Error | null, result?: string) => void;
  getOptions: () => LarkDocWebpackOptions;
  resourcePath: string;
}

/**
 * Webpack loader function.
 * Uses this.callback() for async delivery (standard webpack 5 pattern).
 * compileMarkdown is async (Shiki init), so we chain .then/.catch.
 */
export function larkDocLoader(
  this: WebpackLoaderContext,
  source: string,
): void {
  const callback = this.callback;
  const options = this.getOptions();

  compileMarkdown(source, {
    config: options.config,
    filePath: this.resourcePath,
    debug: options.debug,
  })
    .then((result) => callback(null, result))
    .catch((err: unknown) =>
      callback(err instanceof Error ? err : new Error(String(err))),
    );
}

/**
 * Webpack plugin that auto-registers the .md loader rule.
 */
export class LarkDocPlugin {
  private options: LarkDocWebpackOptions;

  constructor(options: LarkDocWebpackOptions) {
    this.options = options;
  }

  apply(compiler: {
    options: { module: { rules: Array<Record<string, unknown>> } };
  }): void {
    const test = this.options.test || /\.md$/;
    const exclude = this.options.exclude || /node_modules/;

    compiler.options.module.rules.push({
      test,
      exclude,
      use: [
        {
          loader: __filename,
          options: this.options,
        },
      ],
    });
  }
}
