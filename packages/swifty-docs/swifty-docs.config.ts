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

// !!! For your project, it should be: import { defineConfig } from "@swifty.js/docs/vite";
import { defineConfig } from "./src/vite";

export default defineConfig({
  docs: "docs",
  baseUrl: "/swifty/",
  title: "Swifty Docs",
  description: "@swifty.js/docs -- Documentation site generator",
  nav: [
    { text: "基础", link: "/base/" },
    { text: "前端", link: "/frontend/" },
    { text: "后端", link: "/backend/" },
    { text: "QA", link: "/qa/" },
  ],
  sidebar: {
    "/base/": "auto",
    "/frontend/": "auto",
    "/backend/": "auto",
    "/qa/": "auto",
  },
  highlight: { theme: "github-light", darkTheme: "github-dark" },
  search: true,
});
