// !!! For your project, it should be: import { defineConfig } from "@lark.js/docs/vite";
import { defineConfig } from "./src/vite";

export default defineConfig({
  docs: "docs",
  baseUrl: "/lark/",
  title: "Lark Docs",
  description: "@lark.js/docs -- Documentation site generator",
  nav: [
    { text: "Base", link: "/lark/base/" },
    { text: "Frontend", link: "/lark/frontend/" },
    { text: "Backend", link: "/lark/backend/" },
  ],
  sidebar: {
    "/lark/base/": "auto",
    "/lark/frontend/": "auto",
    "/lark/backend/": "auto",
  },
  highlight: { theme: "github-light" },
  search: { provider: "local" },
});
