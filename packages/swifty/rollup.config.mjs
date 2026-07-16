import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import { readFileSync, writeFileSync } from "fs";

const mangleConfig = JSON.parse(readFileSync("./mangle.json", "utf-8"));

const propsMap = new Map();
for (const [key, value] of Object.entries(mangleConfig.props.props)) {
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

const sanitize = (name) => name.replace(/\//g, "-");

export default {
  input: {
    preact: "src/index.js",
    hooks: "src/hooks/index.js",
    compat: "src/compat/internal/index.js",
    "jsx-runtime": "src/jsx-runtime/index.js",
    client: "bridge/client.js",
    scheduler: "bridge/scheduler.js",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: (chunk) => `${sanitize(chunk.name)}.mjs`,
    chunkFileNames: (chunk) => `${sanitize(chunk.name)}.mjs`,
  },
  plugins: [
    esbuild({ target: "es2017" }),
    terser(terserOptions),
    {
      name: "post-build-bridge",
      writeBundle() {
        const jsxBridge =
          'import "./compat.mjs";\nexport * from "./jsx-runtime.mjs";\n';
        writeFileSync("dist/compat-jsx-runtime.mjs", jsxBridge);
        writeFileSync("dist/compat-jsx-dev-runtime.mjs", jsxBridge);
      },
    },
  ],
};
