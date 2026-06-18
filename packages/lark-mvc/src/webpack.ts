/**
 * @lark.js/mvc Webpack Loader for Template Compilation
 *
 * Compiles .html template files using @lark.js/mvc template syntax
 * into JS function modules at build time.
 *
 * 0 configuration — just add the loader rule for .html files.
 * - All template operators: = (escape), ! (raw), @ (ref lookup), : (binding)
 * - @event attribute processing with $g prefix
 * - $eu (URI encoding), $eq (quote encoding), $i (reference lookup)
 * - Debug mode with line tracking
 * - View ID injection
 * - Auto variable extraction via AST analysis
 *
 * Usage in webpack.config.mjs:
 * ```js
 * import { resolve } from 'path';
 *
 * export default {
 *   module: {
 *     rules: [{
 *       test: /\.html$/,
 *       loader: resolve(__dirname, 'node_modules/@lark.js/mvc/webpack'),
 *     }],
 *   },
 * };
 * ```
 */
import { compileTemplate, extractGlobalVars } from "./compiler";

/** Webpack loader context */
interface LoaderContext {
  /** Callback to return the result */
  callback: (error: Error | null, result?: string) => void;
  /** Whether in development mode */
  dev?: boolean;
  /** Loader options */
  getOptions: () => { debug?: boolean; virtualDom?: boolean };
}

/**
 * Webpack loader entry point.
 * Compiles .html template files into JS function modules.
 */
export async function larkMvcLoader(
  this: LoaderContext,
  source: string,
): Promise<void> {
  const options = this.getOptions();
  const debug = options.debug ?? false;
  const virtualDom = options.virtualDom ?? false;

  try {
    // Auto-extract variables from template for 0-config experience
    const globalVars = await extractGlobalVars(source);
    const result = await compileTemplate(source, {
      debug,
      globalVars,
      virtualDom,
    });
    this.callback(null, result);
  } catch (error) {
    this.callback(error instanceof Error ? error : new Error(String(error)));
  }
}

export default larkMvcLoader;
