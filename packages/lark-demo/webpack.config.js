// @ts-check

import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ModuleFederationPlugin from "webpack/lib/container/ModuleFederationPlugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: "./src/remote-entry.ts",

  output: {
    clean: true,
    filename: "js/[name].[contenthash:8].js",
    // Async chunks from dynamic import() use this naming pattern
    chunkFilename: "js/[name].[contenthash:8].js",
    path: path.resolve(__dirname, "./dist-webpack"),
    publicPath: "auto",
  },

  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: "./postcss.config.js",
              },
            },
          },
        ],
      },
      // Lark template processing - compiles .html to template functions
      {
        test: /\.html$/,
        use: [
          {
            loader: "@lark.js/mvc/webpack",
          },
        ],
        exclude: /index\.html$/,
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: "body",
      minify: false,
    }),

    // ── Module Federation (Remote) ──
    // Exposes Lark views so that other apps can consume them at runtime.
    // Host apps load these via: import('lark-demo/counter-view')
    new ModuleFederationPlugin({
      name: "lark_demo",
      filename: "remoteEntry.js",
      exposes: {
        "./counter-view": "./src/exposed/counter-view.ts",
      },
      shared: {
        "@lark.js/mvc": { singleton: true, requiredVersion: "*" },
      },
    }),
  ],
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },

  optimization: {
    // ────────────────────────────────────────────────────────────────────────────────────
    // splitChunks.chunks 枚举值
    //   "initial" 只处理入口 chunk (同步 chunk), 不处理异步 chunk (dynamic import() 产生的 chunk)
    //   "async"   只处理异步 chunk, 不处理入口 chunk
    //   "all"     同时处理入口 chunk 和异步 chunk
    //
    // 使用 "async" 而不是 "all" 的原因
    //   Module Federation 的 shared 模块 (@lark.js/mvc, singleton: true)
    //   必须在入口 chunk 中同步可用, shared scope 初始化时才能正确注册
    //   如果使用 "all", splitChunks 会将 @lark.js/mvc 从入口 chunk 提取到独立的异步 chunk, 导致 shared scope 初始化时, 该模块不是同步加载的
    //   remoteEntry.js 的 window.__lark_DemoMF 全局变量无法正确设置, 抛出 ScriptExternalLoadError
    //
    //   故障链路
    //   Host (lark-devtool) import("lark-demo/counter-view")
    //   Host 的 MF runtime 加载 remoteEntry.js (<script> 注入)
    //   remoteEntry.js 初始化 shared scope, 需要 @lark.js/mvc 同步可用
    //   但是 "all" 模式下 @lark.js/mvc 被提取到 vendor-lark-mvc 异步 chunk
    //   shared scope 初始化时该 chunk 未加载, 导致初始化失败
    //   window.__lark_DemoMF 未设置, 抛出 ScriptExternalLoadError: Loading script failed (missing)
    //
    //   正确: 使用 "async", @lark.js/mvc 在入口 chunk 中同步可用 → shared scope 初始化成功
    // ──────────────────────────────────────────────────────────────────────────────────────────

    // Split view modules into separate chunks
    splitChunks: {
      chunks: "async",
      minSize: 0,
      cacheGroups: {
        // ── View chunks (async, loaded by Framework.use → require) ──
        "view-home": {
          test: /src[\\/]views[\\/]home/,
          name: "view-home",
          chunks: "async",
          enforce: true,
        },
        "view-about": {
          test: /src[\\/]views[\\/]about/,
          name: "view-about",
          chunks: "async",
          enforce: true,
        },
        "view-counter": {
          test: /src[\\/]views[\\/]counter/,
          name: "view-counter",
          chunks: "async",
          enforce: true,
        },
        "view-404": {
          test: /src[\\/]views[\\/]404/,
          name: "view-404",
          chunks: "async",
          enforce: true,
        },
        "comp-counter-store": {
          test: /src[\\/]components[\\/]counter-store/,
          name: "comp-counter-store",
          chunks: "async",
          enforce: true,
        },
        "comp-counter-updater": {
          test: /src[\\/]components[\\/]counter-updater/,
          name: "comp-counter-updater",
          chunks: "async",
          enforce: true,
        },
        // ── MF shared dependency chunks ──
        // @lark.js/mvc singleton shared dependency
        "vendor-lark-mvc": {
          test: /lark[\\/]dist[\\/]index\.js$/,
          name: "vendor-lark-mvc",
          chunks: "async",
          enforce: true,
        },
        // CSS-related loaders (style-loader, css-loader, postcss-loader)
        "vendor-css-loaders": {
          test: /[\\/]node_modules[\\/].*?[\\/]style-loader|css-loader|postcss-loader/,
          name: "vendor-css-loaders",
          chunks: "async",
          enforce: true,
        },
        // @babel/parser (used by lark template compiler)
        "vendor-babel-parser": {
          test: /[\\/]node_modules[\\/].*?[\\/]@babel[\\/]parser/,
          name: "vendor-babel-parser",
          chunks: "async",
          enforce: true,
        },
      },
    },
  },

  devtool: "source-map",
};
