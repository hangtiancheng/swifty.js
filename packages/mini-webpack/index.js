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

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { transformFromAstSync } from "@babel/core";
import { parse } from "@babel/parser";
// import { default as babelTraverse } from '@babel/traverse'
import babelTraverse from "@babel/traverse";
import ejs from "ejs";
import { SyncHook } from "tapable";
import { jsonLoader } from "./loader-demo.js";
import { SetOutputPathPlugin } from "./plugin-demo.js";

/**
 * @typedef {Object} Asset
 * @property {string} absoluteFilePath
 * @property {string} sourceCode
 * @property {string[]} absoluteDepPathArr
 * @property {Record<string, string>} relativeDepPath2absoluteDepPath
 */

// @ts-ignore
const traverser = babelTraverse.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const src = join(__dirname, "./src");
const dist = join(__dirname, "./dist");

const webpackConfig = {
  loaders: [
    {
      regExp: /\.json$/, // test
      /** @type {((sourceCode: string) => string) | ((sourceCode: string) => string)[]} */
      use: [jsonLoader],
    },
  ],
  plugins: [new SetOutputPathPlugin()],
};

/**
 *
 * @param {string} absoluteFilePath
 * @returns {Asset}
 */
function createAsset(absoluteFilePath) {
  let sourceCode = readFileSync(absoluteFilePath, {
    encoding: "utf-8",
  });

  // loader
  webpackConfig.loaders.forEach(({ regExp, use }) => {
    if (regExp.test(absoluteFilePath)) {
      if (Array.isArray(use)) {
        use.reverse().forEach((loader) => {
          sourceCode = loader(sourceCode);
        });
      } else {
        sourceCode = use(sourceCode);
      }
    }
  });

  const babelAst = parse(sourceCode, {
    sourceType: "module",
  });

  const /** @type {string[]} */ absoluteDepPathArr = [];
  const /** @type {Record<string, string>} */ relativeDepPath2absoluteDepPath =
      {};
  traverser(babelAst, {
    ImportDeclaration({ node: { source } }) {
      const /** @type {string} */ relativeDepPath = source.value;
      const absoluteDepPath = join(
        dirname(absoluteFilePath),
        relativeDepPath,
      ).replaceAll("\\", "/");
      relativeDepPath2absoluteDepPath[relativeDepPath] = absoluteDepPath;
      absoluteDepPathArr.push(absoluteDepPath);
    },
  });

  // esm -> cjs
  const babelFileResult = transformFromAstSync(babelAst, undefined, {
    presets: ["@babel/preset-env"],
  });

  if (babelFileResult && babelFileResult.code) {
    sourceCode = babelFileResult.code.replaceAll(
      "require",
      "__webpack_require",
    );
  }

  return {
    absoluteFilePath, // 绝对路径
    sourceCode, // 源代码
    absoluteDepPathArr, // 依赖数组 (相对路径数组)
    relativeDepPath2absoluteDepPath, // 相对路径 -> 绝对路径映射表
  };
}

/**
 *
 * @param {string} absoluteMainFilePath
 */
function createGraph(absoluteMainFilePath) {
  const mainAsset = createAsset(absoluteMainFilePath);
  const /** @type {Record<string, Asset>} */ assetGraph = {};
  const /** @type {Asset[]} */ assetQueue = [mainAsset];

  while (assetQueue.length > 0) {
    const asset = assetQueue.shift();
    if (!asset) {
      break;
    }
    assetGraph[asset.absoluteFilePath] = asset;
    for (const absoluteDepPath of asset.absoluteDepPathArr) {
      if (assetGraph[absoluteDepPath]) {
        continue;
      }
      const depAsset = createAsset(absoluteDepPath);
      assetQueue.push(depAsset);
    }
  }

  return assetGraph;
}

const absoluteMainFilePath = join(src, "./main.js").replaceAll("\\", "/");
const assetGraph = createGraph(absoluteMainFilePath);
// console.log(assetGraph);

const hooks = {
  setOutputPathHook: new SyncHook(["context"]),
};
webpackConfig.plugins.forEach((plugin) => {
  plugin.apply(hooks);
});

/**
 *
 * @param {typeof assetGraph} assetGraph
 */
function build(assetGraph) {
  const template = readFileSync("./template.ejs", { encoding: "utf-8" });
  const generatedCode = ejs.render(template, {
    assetArr: Object.values(assetGraph),
    absoluteMainFilePath,
  });

  rmSync(dist, { force: true, recursive: true });
  mkdirSync(dist);

  let outputPath = join(dist, "./index.js");
  const context = {
    /**
     *
     * @param {string} newOutputPath
     */
    setOutputPath(newOutputPath) {
      outputPath = newOutputPath;
    },
  };

  // publish
  hooks.setOutputPathHook.call(context);
  writeFileSync(outputPath, generatedCode);
}

build(assetGraph);
