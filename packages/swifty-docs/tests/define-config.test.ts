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

import { describe, it, expect, afterEach } from "vitest";
import { defineConfig } from "@/define-config";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function createTempProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "swifty-docs-dc-"));
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf-8");
  }
  return dir;
}

function readGeneratedConfig(projectRoot: string): any {
  const generated = fs.readFileSync(
    path.join(projectRoot, ".swifty-docs/generated/index.js"),
    "utf-8",
  );
  const match = generated.match(/export const docsConfig = (\{[\s\S]*?\n\});/);
  expect(match).not.toBeNull();
  return JSON.parse(match![1]);
}

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("defineConfig baseUrl prefixing", () => {
  it("prefixes unprefixed nav and manual sidebar links with baseUrl", () => {
    const root = createTempProject({
      "docs/guide/intro.md": "# Intro\n",
      "docs/guide/setup.md": "# Setup\n",
    });
    dirs.push(root);

    defineConfig(
      {
        docs: "docs",
        baseUrl: "/my-site/",
        title: "Test",
        nav: [
          { text: "Guide", link: "/guide/intro" },
          { text: "GitHub", link: "https://github.com/example" },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Intro", link: "/guide/intro" },
                { text: "Setup", link: "/guide/setup" },
              ],
            },
          ],
        },
      },
      root,
    );

    const cfg = readGeneratedConfig(root);
    expect(cfg.nav[0].link).toBe("/my-site/guide/intro");
    // External links stay untouched.
    expect(cfg.nav[1].link).toBe("https://github.com/example");
    const items = cfg.sidebar["/guide/"][0].items;
    expect(items[0].link).toBe("/my-site/guide/intro");
    expect(items[1].link).toBe("/my-site/guide/setup");
  });

  it("is idempotent for links that already carry the baseUrl", () => {
    const root = createTempProject({
      "docs/guide/intro.md": "# Intro\n",
    });
    dirs.push(root);

    defineConfig(
      {
        docs: "docs",
        baseUrl: "/my-site/",
        title: "Test",
        nav: [{ text: "Guide", link: "/my-site/guide/intro" }],
        sidebar: {
          "/guide/": [{ text: "Intro", link: "/my-site/guide/intro" }],
        },
      },
      root,
    );

    const cfg = readGeneratedConfig(root);
    expect(cfg.nav[0].link).toBe("/my-site/guide/intro");
    expect(cfg.sidebar["/guide/"][0].link).toBe("/my-site/guide/intro");
  });

  it('matches "auto" sidebar prefixes written without the baseUrl', () => {
    const root = createTempProject({
      "docs/guide/intro.md": "---\ntitle: Intro\n---\n# Intro\n",
      "docs/guide/setup.md": "---\ntitle: Setup\n---\n# Setup\n",
    });
    dirs.push(root);

    defineConfig(
      {
        docs: "docs",
        baseUrl: "/my-site/",
        title: "Test",
        sidebar: { "/guide/": "auto" },
      },
      root,
    );

    const cfg = readGeneratedConfig(root);
    const auto = cfg.sidebar["/guide/"];
    expect(Array.isArray(auto)).toBe(true);
    expect(auto.length).toBeGreaterThan(0);
    const links: string[] = [];
    const collect = (items: any[]) => {
      for (const item of items) {
        if (item.link) links.push(item.link);
        if (item.items) collect(item.items);
      }
    };
    collect(auto);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.startsWith("/my-site/guide")).toBe(true);
    }
  });

  it("leaves links untouched when baseUrl is root", () => {
    const root = createTempProject({
      "docs/intro.md": "# Intro\n",
    });
    dirs.push(root);

    defineConfig(
      {
        docs: "docs",
        baseUrl: "/",
        title: "Test",
        nav: [{ text: "Intro", link: "/intro" }],
      },
      root,
    );

    const cfg = readGeneratedConfig(root);
    expect(cfg.nav[0].link).toBe("/intro");
  });

  it("excludes protected pages from the search index paths", () => {
    const root = createTempProject({
      "docs/public.md": "---\ntitle: Public\n---\n# Public\n",
      "docs/secret.md": "---\ntitle: Secret\nprotected: true\n---\n# Secret\n",
    });
    dirs.push(root);

    defineConfig({ docs: "docs", baseUrl: "/site/", title: "Test" }, root);

    const generated = fs.readFileSync(
      path.join(root, ".swifty-docs/generated/index.js"),
      "utf-8",
    );
    const match = generated.match(
      /_searchablePaths = new Set\((\[[\s\S]*?\])\)/,
    );
    expect(match).not.toBeNull();
    const paths: string[] = JSON.parse(match![1]);
    expect(paths).toContain("/site/public");
    expect(paths).not.toContain("/site/secret");
    // The route/loader itself still exists — the page is reachable, just unsearchable.
    expect(generated).toContain('"/site/secret"');
  });
});
