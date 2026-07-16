import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const mangleConfig = JSON.parse(readFileSync("./mangle.json", "utf-8"));

const propsMap = new Map();
for (const [key, value] of Object.entries(mangleConfig.props.props)) {
  // mangle.json 中的 key 带 $ 前缀（如 $_children），源码中不带（如 _children）
  propsMap.set(key.replace(/^\$/, ""), value);
}

const terserOptions = {
  compress: mangleConfig.minify.compress,
  mangle: {
    properties: {
      ...mangleConfig.minify.mangle.properties,
      cache: { props: propsMap },
    },
  },
};

function createBundle(input, output) {
  return {
    input,
    output: { file: output, format: "esm" },
    plugins: [esbuild({ target: "es2017" }), terser(terserOptions)],
  };
}

export default [
  createBundle("src/index.js", "dist/preact.mjs"),
  createBundle("src/hooks/index.js", "dist/hooks.mjs"),
  createBundle("src/compat/internal/index.js", "dist/compat.mjs"),
  createBundle("src/jsx-runtime/index.js", "dist/jsx-runtime.mjs"),
  createBundle("src/compat/client.js", "dist/client.mjs"),
  createBundle("src/compat/jsx-runtime.js", "dist/compat-jsx-runtime.mjs"),
  createBundle(
    "src/compat/jsx-dev-runtime.js",
    "dist/compat-jsx-dev-runtime.mjs",
  ),
  createBundle("src/compat/scheduler.js", "dist/scheduler.mjs"),
];
