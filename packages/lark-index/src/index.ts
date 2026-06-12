/**
 * Bootstrap entry.
 *
 * The single top-level route renders the `layout` view, which embeds three
 * sub-views via `v-lark`:
 *   - views/personal-bookmarks   (left,   1fr, virtual scroll list)
 *   - views/work-bookmarks       (center, 1fr, virtual scroll list)
 *   - views/read-list-bookmarks  (right,  1fr, virtual scroll list)
 *
 * Every view ships as its own dynamic-import chunk so the initial paint
 * pulls only the layout + the small modules it strictly needs. Sub-view
 * chunks are preloaded in parallel with the layout chunk to avoid the
 * mountZone phase racing with module loading.
 */
import { Framework, registerViewClass, View } from "@lark.js/mvc";
import type { FrameworkConfig } from "@lark.js/mvc";
import "./index.css";

// View-path -> dynamic loader. Each call site becomes a separate chunk in
// both esbuild and vite/webpack production output.
const VIEW_MODULES: Record<string, () => Promise<unknown>> = {
  layout: () => import("./views/layout"),
  "views/personal-bookmarks": () => import("./views/personal-bookmarks"),
  "views/work-bookmarks": () => import("./views/work-bookmarks"),
  "views/read-list-bookmarks": () => import("./views/read-list-bookmarks"),
};

// When the layout view is requested, preload its three sub-views in
// parallel so mountZone finds them already registered.
const subViews = [
  "views/personal-bookmarks",
  "views/work-bookmarks",
  "views/read-list-bookmarks",
];

/**
 * Unwrap an ES module's default export. Vite dev mode does not set
 * __esModule on ESM modules, so we probe the default field directly.
 */
function extractDefault(mod: unknown): unknown {
  if (mod && typeof mod === "object") {
    const m = mod as Record<string, unknown>;
    if (typeof m["default"] === "function") return m["default"];
  }
  return mod;
}

const config: FrameworkConfig = {
  rootId: "app",
  defaultPath: "/",
  defaultView: "layout",
  routes: {
    "/": "layout",
  },
  unmatchedView: "layout",
  error(e: Error) {
    console.error("[@lark.js/index] framework error:", e);
  },

  require: async (names: string[]): Promise<unknown[]> => {
    // Collect sub-view preloads triggered by a `layout` request.
    const preload: string[] = [];
    for (const name of names) {
      if (name !== "layout") continue;
      for (const dep of subViews) {
        if (!names.includes(dep) && !preload.includes(dep)) {
          preload.push(dep);
        }
      }
    }

    const allNames = [...names, ...preload];
    const results = await Promise.all(
      allNames.map(async (name) => {
        const loader = VIEW_MODULES[name];
        if (!loader) {
          console.warn(`[@lark.js/index] unknown view path: ${name}`);
          return { name, ViewClass: undefined as unknown };
        }
        const mod = await loader();
        const ViewClass = extractDefault(mod);

        // Register preloaded sub-views immediately. Requested views are
        // registered by mountView's use() callback inside the framework.
        if (preload.includes(name) && typeof ViewClass === "function") {
          registerViewClass(name, ViewClass as typeof View);
        }

        return { name, ViewClass };
      }),
    );

    return results
      .filter((r) => names.includes(r.name))
      .map((r) => r.ViewClass);
  },
};

Framework.boot(config);
