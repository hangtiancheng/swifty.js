import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "Preact.createElement",
    jsxFragment: "Preact.Fragment",
  },
});
