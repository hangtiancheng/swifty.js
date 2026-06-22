/**
 * Route map generator.
 *
 * Converts scanned DocRoute[] into the format expected by
 * @lark.js/mvc's FrameworkConfig.routes.
 */
import type { DocRoute } from "./types";

/**
 * Generate a routes map object for Framework.boot({ routes }).
 *
 * Each entry maps a URL path to a viewId:
 * ```
 * { "/docs/guide/": "docs-guide-index", "/docs/guide/config": "docs-guide-config" }
 * ```
 */
export function generateRouteMap(routes: DocRoute[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const route of routes) {
    map[route.path] = route.viewId;
  }
  return map;
}

/**
 * Generate a JS module source string that imports all compiled doc views
 * and registers them with registerViewClass.
 *
 * This is emitted as a virtual module by the build plugins.
 */
export function generateBootModule(routes: DocRoute[]): string {
  const imports = routes
    .map((r, i) => `import view${i} from ${JSON.stringify(r.filePath)};`)
    .join("\n");

  const registrations = routes
    .map((r, i) => `registerViewClass(${JSON.stringify(r.viewId)}, view${i});`)
    .join("\n");

  return [
    'import { registerViewClass } from "@lark.js/mvc";',
    imports,
    "",
    registrations,
  ].join("\n");
}
