import { describe, it, expect } from "vitest";
import { scanDocsDir } from "../src/scanner";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function createTempDocs(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lark-doc-test-"));
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf-8");
  }
  return dir;
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe("scanDocsDir", () => {
  it("scans a flat docs directory", () => {
    const dir = createTempDocs({
      "index.md": "---\ntitle: Home\n---\n# Home\n",
      "getting-started.md": "# Getting Started\n\nIntro.",
      "config.md": "---\ntitle: Config\n---\n# Config\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");

      expect(routes.length).toBe(3);

      const paths = routes.map((r) => r.path).sort();
      expect(paths).toContain("/docs/");
      expect(paths).toContain("/docs/getting-started");
      expect(paths).toContain("/docs/config");
    } finally {
      cleanup(dir);
    }
  });

  it("scans nested directories", () => {
    const dir = createTempDocs({
      "index.md": "# Home\n",
      "guide/index.md": "# Guide\n",
      "guide/config.md": "# Config\n",
      "api/router.md": "# Router\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");

      expect(routes.length).toBe(4);
      const paths = routes.map((r) => r.path).sort();
      expect(paths).toContain("/docs/");
      expect(paths).toContain("/docs/guide/");
      expect(paths).toContain("/docs/guide/config");
      expect(paths).toContain("/docs/api/router");
    } finally {
      cleanup(dir);
    }
  });

  it("ignores files starting with _ or .", () => {
    const dir = createTempDocs({
      "index.md": "# Home\n",
      "_draft.md": "# Draft\n",
      ".hidden.md": "# Hidden\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes.length).toBe(1);
      expect(routes[0].path).toBe("/docs/");
    } finally {
      cleanup(dir);
    }
  });

  it("ignores node_modules and .git directories", () => {
    const dir = createTempDocs({
      "index.md": "# Home\n",
      "node_modules/pkg.md": "# Pkg\n",
      ".git/config.md": "# Git\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes.length).toBe(1);
    } finally {
      cleanup(dir);
    }
  });

  it("extracts frontmatter from scanned files", () => {
    const dir = createTempDocs({
      "test.md":
        "---\ntitle: Test Page\ndescription: A test\nsidebar_position: 2\n---\n# Test\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes.length).toBe(1);
      expect(routes[0].pageData.title).toBe("Test Page");
      expect(routes[0].pageData.description).toBe("A test");
      expect(routes[0].pageData.sidebarPosition).toBe(2);
    } finally {
      cleanup(dir);
    }
  });

  it("extracts headings from content", () => {
    const dir = createTempDocs({
      "test.md": "# Title\n\n## Section One\n\n### Sub\n\n## Section Two\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      const headings = routes[0].pageData.headings;

      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({
        level: 2,
        text: "Section One",
        slug: "section-one",
      });
      expect(headings[1]).toEqual({
        level: 3,
        text: "Sub",
        slug: "sub",
      });
      expect(headings[2]).toEqual({
        level: 2,
        text: "Section Two",
        slug: "section-two",
      });
    } finally {
      cleanup(dir);
    }
  });

  it("ignores headings inside fenced code blocks", () => {
    const dir = createTempDocs({
      "test.md":
        "# Title\n\n## Real Heading\n\n```markdown\n## Not A Heading\n```\n\n## Another Heading\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      const headings = routes[0].pageData.headings;
      const texts = headings.map((h) => h.text);

      expect(texts).toContain("Real Heading");
      expect(texts).toContain("Another Heading");
      expect(texts).not.toContain("Not A Heading");
    } finally {
      cleanup(dir);
    }
  });

  it("does not infer title from headings inside code blocks", () => {
    const dir = createTempDocs({
      "test.md": "```markdown\n# npm install\n```\n\n# Real Title\n\nContent.",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes[0].pageData.title).toBe("Real Title");
    } finally {
      cleanup(dir);
    }
  });

  it("excludes drafts when excludeDrafts is true", () => {
    const dir = createTempDocs({
      "published.md": "# Published\n",
      "draft.md": "---\ndraft: true\n---\n# Draft\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/", { excludeDrafts: true });
      expect(routes.length).toBe(1);
      expect(routes[0].pageData.title).toBe("Published");
    } finally {
      cleanup(dir);
    }
  });

  it("generates unique viewIds", () => {
    const dir = createTempDocs({
      "index.md": "# Home\n",
      "guide/index.md": "# Guide\n",
      "guide/config.md": "# Config\n",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      const viewIds = routes.map((r) => r.viewId);
      const unique = new Set(viewIds);
      expect(unique.size).toBe(viewIds.length);
    } finally {
      cleanup(dir);
    }
  });

  it("normalizes baseUrl", () => {
    const dir = createTempDocs({
      "index.md": "# Home\n",
    });

    try {
      // baseUrl without trailing slash
      const routes = scanDocsDir(dir, "/docs");
      expect(routes[0].path).toBe("/docs/");
    } finally {
      cleanup(dir);
    }
  });

  it("infers title from first h1 when no frontmatter title", () => {
    const dir = createTempDocs({
      "test.md": "# My Inferred Title\n\nContent.",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes[0].pageData.title).toBe("My Inferred Title");
    } finally {
      cleanup(dir);
    }
  });

  it("derives title from filename when no heading and no frontmatter", () => {
    const dir = createTempDocs({
      "getting-started.md": "Just some content, no heading.",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes[0].pageData.title).toBe("Getting Started");
    } finally {
      cleanup(dir);
    }
  });

  it("derives title from parent directory for index.md without heading", () => {
    const dir = createTempDocs({
      "guide/index.md": "Guide content without heading.",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes[0].pageData.title).toBe("Guide");
    } finally {
      cleanup(dir);
    }
  });

  it("uses 'Home' as fallback for root index.md without heading", () => {
    const dir = createTempDocs({
      "index.md": "Content without heading.",
    });

    try {
      const routes = scanDocsDir(dir, "/docs/");
      expect(routes[0].pageData.title).toBe("Home");
    } finally {
      cleanup(dir);
    }
  });

  it("returns empty array for non-existent directory", () => {
    const routes = scanDocsDir("/non/existent/path", "/docs/");
    expect(routes).toEqual([]);
  });
});
