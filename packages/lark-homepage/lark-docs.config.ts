import { defineConfig } from "@lark.js/docs";

export default defineConfig({
  docs: "docs",
  baseUrl: "/docs/",
  routeMode: "history",
  title: "Lark Homepage",
  description: "@lark.js/docs -- Documentation site generator demo",
  nav: [
    { text: "Base", link: "/docs/base/" },
    { text: "Frontend", link: "/docs/frontend/" },
    { text: "Backend", link: "/docs/backend/" },
  ],
  sidebar: {
    "/docs/base/": "auto",
    "/docs/frontend/": "auto",
    "/docs/backend/": "auto",
  },
  highlight: {
    theme: "github-light",
    languages: [
      "typescript",
      "javascript",
      "html",
      "css",
      "json",
      "bash",
      "yaml",
      "markdown",
      "go",
      "sql",
      "python",
    ],
  },
  search: { provider: "local" },
});
