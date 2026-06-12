/**
 * CrossSite: Micro-frontend bridge View for cross-project view loading.
 *
 * For Lark + Webpack Module Federation.
 * Provides skeleton rendering, prepare preloading, assign reuse, and remote view mounting.
 *
 * Usage (in host project):
 *   1. Register CrossSite as the bridge view for cross-site paths:
 *      registerViewClass('cross-site', CrossSite);
 *   2. Use v-lark="cross-site?view=remote-app/views/home&param=1" in template
 *   3. CrossSite loads the remote project's prepare module, then mounts the actual view
 */
import { View } from "./view";
import { Frame } from "./frame";
import { use, config } from "./module-loader";
import { parseUri, toMap, funcWithTry, noop } from "./utils";
import type { CrossSiteConfig, ViewInterface } from "./types";

// ============================================================
// Internal types for CrossSite view state
// ============================================================

/** CrossSite view internal state, stored as custom instance properties */
interface CrossSiteState {
  /** Async operation sign counter, -1 = destroyed */
  $sign: number;
  /** Remote view path to load (e.g., "remote-app/views/home") */
  $view: string;
  /** Merged params for the remote view */
  $params: Record<string, unknown>;
}

// ============================================================
// Remote prepare Promise cache (per project)
// ============================================================

/** Cached prepare promises per project name */
const preparePromises: Record<string, Promise<void>> = {};

/** Cached project map from crossConfigs */
let projectsMap: Record<string, CrossSiteConfig> | null = null;

// ============================================================
// CrossSite loader: load remote project's prepare module
// ============================================================

/** Remote prepare module signature (the function exposed by a remote project). */
type PrepareFn = (opts: { bizCode?: string | undefined }) => Promise<void>;

/**
 * Load a remote project's prepare module via Module Federation.
 * Caches the prepare Promise per project to avoid duplicate loading.
 *
 * @param viewPath - The remote view path (e.g., "remote-app/views/home")
 * @param bizCode  - Optional business code for multi-tenant scenarios
 */
function loadRemoteView(viewPath: string, bizCode?: string): Promise<void> {
  const crossConfigs = config.crossConfigs || window.crossConfigs;
  const currentName = config.projectName || "";
  const slashIndex = viewPath.indexOf("/");
  const projectName =
    slashIndex > -1 ? viewPath.substring(0, slashIndex) : viewPath;

  // Same project, no need to load remote
  if (projectName === currentName) return Promise.resolve();

  if (!preparePromises[projectName]) {
    // Build project map from crossConfigs (cached)
    if (!projectsMap) {
      const map = toMap(crossConfigs || [], "projectName");
      projectsMap = map as Record<string, CrossSiteConfig>;
    }

    const info = projectsMap[projectName];
    if (!info) {
      return Promise.reject(
        new Error(`Cannot find ${projectName} from crossConfigs`),
      );
    }

    // Load remote prepare module via use() → FrameworkConfig.require
    preparePromises[projectName] = use(`${projectName}/prepare`)
      .then((modules: unknown[]) => {
        let mod = modules[0];
        // Handle ESM default export
        if (mod && typeof mod === "object" && mod !== null) {
          const rec = mod as Record<string, unknown>;
          if (rec["__esModule"]) {
            mod = rec["default"];
          }
        }
        // Call prepare function with bizCode
        if (typeof mod === "function") {
          return (mod as PrepareFn)({ bizCode });
        }
        return undefined;
      })
      .catch((err: unknown) => {
        // Remove cached promise on failure so it can be retried
        Reflect.deleteProperty(preparePromises, projectName);
        throw err;
      });
  }

  return preparePromises[projectName];
}

/**
 * Reset the projects map cache (useful when crossConfigs change at runtime).
 */
export function resetProjectsMap(): void {
  projectsMap = null;
}

// ============================================================
// Skeleton template
// ============================================================

/**
 * Default skeleton template for the loading state.
 * Renders a container div for the remote view with skeleton content.
 * The container id follows the `mf_${viewId}` convention so that
 * mountFrame can find it.
 */
const skeletonTemplate = (data: unknown, viewId: string): string => {
  let skeletonHtml = "<div>Loading...</div>";
  if (data && typeof data === "object") {
    const candidate = (data as { skeleton?: unknown }).skeleton;
    if (typeof candidate === "string") skeletonHtml = candidate;
  }
  // Module Federation container id
  return `<div id="mf_${viewId}">${skeletonHtml}</div>`;
};

// ============================================================
// CrossSite View
// ============================================================

/** Full CrossSite view context, including its custom state + methods. */
type CrossSiteView = ViewInterface &
  CrossSiteState & {
    updateView: () => void;
  };

/**
 * CrossSite bridge View for micro-frontend integration.
 *
 * Flow:
 * 1. CrossSite is mounted as a regular view (registered as "cross-site")
 * 2. render() shows skeleton template with a child container
 * 3. updateView() loads the remote project's prepare module
 * 4. Once loaded, mounts the actual remote view into the child container
 * 5. On re-assign (same view path), calls assign on the remote view instead of re-mounting
 */
const CrossSite = View.extend({
  /** Skeleton template renders loading state + child container */
  template: skeletonTemplate,

  init(this: CrossSiteView, params: Record<string, unknown>) {
    this.$sign = 0;
    this.on("destroy", () => {
      this.$sign = -1;
    });
    this.assign?.(params);
  },

  assign(
    this: CrossSiteView,
    data: Record<string, unknown>,
  ): boolean | undefined {
    // Store the remote view path
    this.$view = typeof data["view"] === "string" ? data["view"] : "";

    // Merge params: top-level data + nested data.params
    const nested = data["params"];
    const nestedParams =
      nested && typeof nested === "object"
        ? (nested as Record<string, unknown>)
        : {};
    this.$params = { ...data, ...nestedParams };

    this.updater.set({
      skeleton: data["skeleton"],
      skeletonParams: data["skeletonParams"] || {},
      bizCode: data["bizCode"],
    });

    // If already rendered (sign > 0), trigger updateView
    if (this.$sign > 0) {
      this.updateView();
    }
    return false;
  },

  async updateView(this: CrossSiteView): Promise<void> {
    const sign = ++this.$sign;

    const stored = this.updater.get<{ bizCode?: string }>();
    const bizCode = stored.bizCode;

    // Load remote project's prepare module
    try {
      await loadRemoteView(this.$view, bizCode);
    } catch (ex: unknown) {
      const node = document.getElementById("mf_" + this.id);
      if (node) {
        const err = ex instanceof Error ? ex : new Error(String(ex));
        node.innerHTML = err.message || String(err);
      }
    }

    // Race condition guard: if Frame was unmounted/re-mounted during async load
    if (this.$sign !== sign) return;

    const mf = Frame.get("mf_" + this.id);
    const parsedNew = parseUri(this.$view);
    const newPath = parsedNew.path;
    const oldPath = mf?.viewPath ? parseUri(mf.viewPath).path : "";
    const view = mf?.view;

    // If same path and view supports assign, update in-place; otherwise re-mount
    if (newPath === oldPath && view && typeof view.assign === "function") {
      const result = funcWithTry(view.assign, [this.$params], view, noop);
      if (result) {
        view.render();
      }
      return;
    }

    // Mount the actual remote view into the child container
    const owner = this.owner;
    if (owner && typeof owner !== "number") {
      owner.mountFrame("mf_" + this.id, this.$view, this.$params);
    }
  },

  render(this: CrossSiteView): void {
    const params = this.$params;
    this.updater.digest({
      skeleton: params?.["skeleton"],
    });
    this.updateView();
  },

  /**
   * Invoke a method on the remote view.
   * Usage: mf.invoke('callView', methodName, ...args)
   */
  callView(this: ViewInterface, name: string, ...args: unknown[]): unknown {
    const mf = Frame.get("mf_" + this.id);
    return mf?.invoke(name, args);
  },
});

export default CrossSite;
