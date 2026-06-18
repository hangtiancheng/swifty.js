// @ts-check

import { defineConfig } from "@rspack/cli";
import { LarkMvcPlugin } from "@lark.js/mvc/rspack";
import rspack from "@rspack/core";
import tailwindcss from "@tailwindcss/postcss";

export default defineConfig({
  entry: "./src/remote-entry.ts",

  output: {
    clean: true,
    filename: "js/[name].[contenthash:8].js",
    chunkFilename: "js/[name].[contenthash:8].js",
    path: "./dist-rspack",
    publicPath: "auto",
  },

  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": "./src",
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript" },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [tailwindcss],
              },
            },
          },
        ],
        type: "css",
      },
    ],
  },

  plugins: [
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
      inject: "body",
      minify: false,
    }),

    // Lark template processing — compiles .html to template functions.
    // Automatically registers a loader rule; excludes index.html so the
    // HTML entry point is not mistakenly compiled as a Lark template.
    new LarkMvcPlugin({ virtualDom: true, exclude: /index\.html$/ }),

    // ── Module Federation (Remote) ──
    new rspack.container.ModuleFederationPlugin({
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
  },

  optimization: {
    // 使用 "async" 而不是 "all" 的原因:
    // MF 的 shared 模块 (@lark.js/mvc, singleton: true)
    // 必须在入口 chunk 中同步可用, shared scope 初始化时才能正确注册
    // 如果使用 "all", splitChunks 会将 @lark.js/mvc 从入口 chunk 提取到独立的异步 chunk,
    // 导致 remoteEntry.js 初始化 shared scope 时抛出 ScriptExternalLoadError
    splitChunks: {
      chunks: "async",
      minSize: 0,
      cacheGroups: {
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
        "vendor-lark-mvc": {
          test: /lark[\\/]dist[\\/]index\.js$/,
          name: "vendor-lark-mvc",
          chunks: "async",
          enforce: true,
        },
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
});
