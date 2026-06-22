import { describe, it, expect } from "vitest";
import { generateSidebar } from "../src/sidebar-generator";
import type { DocsRoute } from "../src/types";

function makeRoute(
  path: string,
  title: string,
  opts?: { sidebarPosition?: number; sidebarLabel?: string },
): DocsRoute {
  return {
    path,
    viewId: path.replace(/\//g, "-"),
    filePath: `/project/docs${path.replace("/docs", "")}.md`,
    pageData: {
      title,
      headings: [],
      relativePath: "",
      sidebarPosition: opts?.sidebarPosition,
      sidebarLabel: opts?.sidebarLabel,
    },
  };
}

describe("generateSidebar", () => {
  it("generates sidebar items from routes", () => {
    const routes: DocsRoute[] = [
      makeRoute("/docs/guide/", "Guide Home"),
      makeRoute("/docs/guide/config", "Configuration"),
      makeRoute("/docs/guide/plugins", "Plugins"),
    ];

    const items = generateSidebar(routes, "/guide/", "/docs/");

    expect(items.length).toBeGreaterThan(0);
    const allTexts = items.flatMap((item) =>
      item.items ? [item.text, ...item.items.map((i) => i.text)] : [item.text],
    );
    expect(allTexts).toContain("Guide Home");
    expect(allTexts).toContain("Configuration");
    expect(allTexts).toContain("Plugins");
  });

  it("sorts by sidebarPosition", () => {
    const routes: DocsRoute[] = [
      makeRoute("/docs/guide/plugins", "Plugins", { sidebarPosition: 3 }),
      makeRoute("/docs/guide/config", "Configuration", { sidebarPosition: 1 }),
      makeRoute("/docs/guide/intro", "Introduction", { sidebarPosition: 2 }),
    ];

    const items = generateSidebar(routes, "/guide/", "/docs/");

    // All items should be under a group or at root level
    const flatItems = items.flatMap((item) => item.items || [item]);
    expect(flatItems[0].text).toBe("Configuration");
    expect(flatItems[1].text).toBe("Introduction");
    expect(flatItems[2].text).toBe("Plugins");
  });

  it("uses sidebarLabel when available", () => {
    const routes: DocsRoute[] = [
      makeRoute("/docs/guide/config", "Configuration", {
        sidebarLabel: "Config",
      }),
    ];

    const items = generateSidebar(routes, "/guide/", "/docs/");
    const flatItems = items.flatMap((item) => item.items || [item]);
    expect(flatItems[0].text).toBe("Config");
  });

  it("groups by subdirectory", () => {
    const routes: DocsRoute[] = [
      makeRoute("/docs/guide/getting-started", "Getting Started"),
      makeRoute("/docs/guide/api/router", "Router API"),
      makeRoute("/docs/guide/api/state", "State API"),
    ];

    const items = generateSidebar(routes, "/guide/", "/docs/");

    // Should have root items and an "Api" group
    const groups = items.filter((item) => item.items && item.items.length > 0);
    const rootItems = items.filter(
      (item) => !item.items || item.items.length === 0,
    );

    expect(rootItems.some((i) => i.text === "Getting Started")).toBe(true);
    expect(groups.some((g) => g.text === "Api")).toBe(true);
  });

  it("handles empty routes", () => {
    const items = generateSidebar([], "/guide/", "/docs/");
    expect(items).toEqual([]);
  });

  it("handles no matching routes for prefix", () => {
    const routes: DocsRoute[] = [makeRoute("/docs/api/router", "Router")];

    const items = generateSidebar(routes, "/guide/", "/docs/");
    expect(items).toEqual([]);
  });
});
