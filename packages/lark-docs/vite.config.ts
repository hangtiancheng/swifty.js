import { defineConfig, type PluginOption } from "vite";
import { larkMvcPlugin7 } from "@lark.js/mvc/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    larkMvcPlugin7({
      debug: true,
      virtualDom: true,
      useSwc: true,
    }),
    tailwindcss() as PluginOption,
  ],

  build: {
    rollupOptions: {},
  },
});
