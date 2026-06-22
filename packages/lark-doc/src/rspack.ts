/**
 * Rspack loader and plugin for @lark.js/docs.
 *
 * Mirrors the Webpack integration but returns a Promise directly
 * (Rspack async loaders must return the result, not call this.callback()).
 *
 * Usage:
 * ```ts
 * import { LarkDocPlugin } from "@lark.js/docs/rspack";
 *
 * export default {
 *   plugins: [new LarkDocPlugin({ config: docConfig })],
 * };
 * ```
 */
import type { DocConfig } from "./types";
import { compileMarkdown } from "./compiler/compile-markdown";

export interface LarkDocRspackOptions {
  /** Full doc config. */
  config: DocConfig;
  /** Enable debug mode. */
  debug?: boolean;
  /** Test regex. Default: /\.md$/ */
  test?: RegExp;
  /** Exclude regex. Default: /node_modules/ */
  exclude?: RegExp;
}

interface RspackLoaderContext {
  getOptions: () => LarkDocRspackOptions;
  resourcePath: string;
}

/**
 * Rspack loader function.
 * Returns a Promise directly (Rspack async loaders must return the result).
 */
export async function larkDocLoader(
  this: RspackLoaderContext,
  source: string,
): Promise<string> {
  const options = this.getOptions();
  return await compileMarkdown(source, {
    config: options.config,
    filePath: this.resourcePath,
    debug: options.debug,
  });
}

/**
 * Rspack plugin that auto-registers the .md loader rule.
 */
export class LarkDocPlugin {
  private options: LarkDocRspackOptions;

  constructor(options: LarkDocRspackOptions) {
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
