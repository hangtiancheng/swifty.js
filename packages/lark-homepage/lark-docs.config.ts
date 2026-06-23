import { defineConfig } from "@lark.js/docs/vite";

export default defineConfig({
  docs: "docs",
  baseUrl: "/lark/",
  routeMode: "history",
  title: "Lark Homepage",
  description: "@lark.js/lark -- Documentation site generator (Homepage)",
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
  highlight: {
    theme: "github-light",
    languages: [
      "javascript",
      "typescript",
      "html",
      "css",
      "markdown",
      "json",
      "yaml",
      "bash",
      "sql",
      "python",
      "go",
    ],
  },
  search: { provider: "local" },
});
