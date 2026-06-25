/**
 * HMR (Hot Module Replacement) support for lark-mvc views.
 *
 * Provides standard `import.meta.hot` ESM HMR integration.
 * When a view module (or its imported .html template) changes:
 * 1. Old View class is invalidated in the registry (via dispose)
 * 2. New View class is registered and all mounted frames are re-mounted (via accept)
 *
 * Usage in view files:
 * ```ts
 * import { defineView } from '@lark.js/mvc';
 * import template from './home.html';
 *
 * const HomeView = defineView({ template, ... });
 *
 * if (import.meta.hot) {
 *   HomeView.dispose(import.meta.hot, 'home');
 *   HomeView.accept(import.meta.hot, 'home');
 * }
 *
 * export default HomeView;
 * ```
 *
 * The View class exposes `static accept()` and `static dispose()` methods
 * that delegate to this module. `defineView()` subclasses inherit them
 * automatically via the prototype chain.
 */
import { parseUri } from "./utils";
import {
  invalidateViewClass,
  registerViewClass,
  getViewClass,
  getViewClassRegistry,
} from "./view-registry";
import { View } from "./view";
import type { ViewInterface, ViewTemplate, FrameInterface } from "./types";
import { Frame } from "./frame";

// ============================================================
// HotContext — minimal interface compatible with Vite and webpack
// ============================================================

/**
 * Minimal HMR context interface.
 * Compatible with Vite's `import.meta.hot` and webpack's `module.hot`.
 * Defined here to avoid depending on bundler-specific type packages.
 */
export interface HotContext {
  /** Accept a self-update. The callback receives the new module namespace. */
  accept(cb?: (mod: { default?: unknown } | undefined) => void): void;
  /** Register a cleanup callback that runs before this module is replaced. */
  dispose(cb: (data: unknown) => void): void;
  /** Force a full page reload (fallback when HMR cannot handle the update). */
  invalidate(): void;
}

// ============================================================
// reloadViews — find and re-mount all frames using a viewPath
//
// NOTE: This performs a FULL remount (unmount + mount), which destroys the
// old view instance and loses all view-local state (updater.data, resources,
// event subscriptions). For HMR updates where state preservation is desired,
// prefer `hotSwapView` / `hotSwapFrames` below. `reloadViews` is retained for
// backward compatibility and for cases where a full remount is intentional.
// ============================================================

/**
 * Find all currently mounted frames whose viewPath matches the given path,
 * and re-mount them.
 *
 * After a new View class is registered via `registerViewClass`, calling this
 * function triggers `frame.mountView()` on each matching frame. Since the new
 * class is already in the registry, `Frame.mountView` takes the synchronous
 * path (`getViewClass` returns the class immediately).
 *
 * @param viewPath - The view path to match (e.g. 'home', 'components/list')
 */
export function reloadViews(viewPath: string): void {
  const allFrames = Frame.getAll();
  const toReload: Array<{ frame: FrameInterface; fullPath: string }> = [];

  for (const [, frame] of allFrames) {
    if (frame.viewPath) {
      const parsed = parseUri(frame.viewPath);
      if (parsed.path === viewPath) {
        toReload.push({ frame, fullPath: frame.viewPath });
      }
    }
  }

  for (const { frame, fullPath } of toReload) {
    frame.mountView(fullPath);
  }
}

// ============================================================
// hotSwapView — in-place prototype swap preserving view state
// ============================================================

/**
 * Collect all currently mounted frames whose viewPath matches `viewPath`.
 */
function findFramesByViewPath(
  viewPath: string,
): Array<{ frame: FrameInterface; fullPath: string }> {
  const result: Array<{ frame: FrameInterface; fullPath: string }> = [];
  for (const [, frame] of Frame.getAll()) {
    if (frame.viewPath) {
      const parsed = parseUri(frame.viewPath);
      if (parsed.path === viewPath) {
        result.push({ frame, fullPath: frame.viewPath });
      }
    }
  }
  return result;
}

/**
 * Hot-swap a single frame's view in-place, preserving runtime state.
 *
 * Unlike `frame.mountView()` (used by `reloadViews`) which destroys the old
 * view instance and creates a fresh one — losing `updater.data`, captured
 * resources, and event subscriptions — this method:
 *
 * 1. Unbinds old DOM/global events (using the OLD prototype's event maps).
 * 2. Prepares the new View class (scans event methods, wraps render).
 * 3. Swaps the instance's `[[Prototype]]` to the new class's prototype —
 *    the instance keeps its identity, `updater`, `updater.data`, `resources`,
 *    `_events`, `signature`, `id`, and `owner`. Methods, event maps, and the
 *    wrapped `$renderWrap` now come from the new class.
 * 4. Updates the `template` instance property (set by the old constructor)
 *    to the new class's template.
 * 5. Binds new DOM/global events (using the NEW prototype's event maps).
 * 6. Force-renders with the NEW template + EXISTING data.
 *
 * The user's `init()` / `ctor()` / `render()` are NOT re-invoked, so any
 * state-initialization logic inside them (e.g. `counter-updater`'s
 * `render() { this.updater.digest({ count: 0, ... }) }`) does not reset
 * the view's data. Instead `updater.forceDigest()` re-runs the new template
 * against the preserved data.
 *
 * If the frame has no existing view instance (e.g. it was unmounted or the
 * async load hasn't completed), falls back to a fresh `mountView`.
 */
export function hotSwapView(
  frame: FrameInterface,
  NewViewClass: typeof View,
): void {
  const oldView = frame.view;
  if (!oldView) {
    // No existing instance — fall back to fresh mount.
    if (frame.viewPath) {
      frame.mountView(frame.viewPath);
    }
    return;
  }

  // 1. Unbind old DOM/global events using OLD prototype's event maps.
  //    Must happen BEFORE proto swap, otherwise delegateEvents would read
  //    the NEW maps and fail to unbind the OLD bindings.
  View.delegateEvents(oldView, true);

  // 2. Prepare the new class (scan event methods, wrap render).
  //    Idempotent — guarded by `NewViewClass.ctors`.
  View.prepare(NewViewClass);

  // 3. Swap prototype: oldView now has new methods + new event maps
  //    + new $renderWrap. Instance properties (updater, data, resources,
  //    _events, signature, id, owner) are all preserved.
  Object.setPrototypeOf(oldView, NewViewClass.prototype);

  // 4. Update template instance property. View.extend sets template as an
  //    instance property in the constructor (after super()), so the old
  //    instance still holds the OLD template. Overwrite with the new one.
  const newProto = NewViewClass.prototype as unknown as Record<string, unknown>;
  const oldViewRec = oldView as unknown as Record<string, unknown>;
  oldViewRec["template"] = newProto["template"];

  // 5. Bind new DOM/global events using NEW prototype's event maps.
  View.delegateEvents(oldView, false);

  // 6. Force a full re-render with the NEW template + EXISTING data.
  //    We intentionally bypass the user's render() method (which may reset
  //    state — e.g. counter-updater's render does digest({count:0,...})).
  //    Instead we replicate the render wrapper's side effects (signature++,
  //    "render" event, destroy destroyOnRender resources) and call
  //    updater.forceDigest() directly, which re-runs the new template
  //    against the preserved updater.data.
  const viewAsInterface = oldView as ViewInterface;
  if (viewAsInterface.signature > 0) {
    viewAsInterface.signature++;
    viewAsInterface.fire("render");
    View.destroyAllResources(viewAsInterface, false);
    viewAsInterface.updater.forceDigest();
  }
}

/**
 * Find all frames matching `viewPath` and hot-swap each in-place.
 *
 * This is the state-preserving counterpart to `reloadViews`. It is used by
 * `acceptView` so that HMR updates don't lose view-local state (e.g. a
 * counter's current value, form input, scroll-derived data).
 */
export function hotSwapFrames(
  viewPath: string,
  NewViewClass: typeof View,
): void {
  const targets = findFramesByViewPath(viewPath);
  for (const { frame } of targets) {
    hotSwapView(frame, NewViewClass);
  }
}

// ============================================================
// hotSwapByTemplate — template-only HMR (no viewPath needed)
// ============================================================

/**
 * Hot-swap the template function on every view whose `template` property
 * matches `oldTemplate`.
 *
 * This is the zero-config HMR primitive used by the **compiled template
 * module** (`.html` files). When a `.html` template changes, the bundler's
 * HMR system re-executes the template module, which self-accepts and calls
 * this function with the old and new template function references.
 *
 * Unlike `hotSwapView` (which swaps the entire prototype and re-delegates
 * events), this only updates the `template` instance property and
 * force-renders. This is correct because:
 * - Event handlers live on the View **prototype** (the `.ts` file), not the
 *   template. A template-only change doesn't add/remove handlers.
 * - The EventDelegator resolves `@event` handler names at click-time via the
 *   prototype, so no re-binding is needed.
 * - `updater.forceDigest()` re-runs the new template against the view's
 *   existing `updater.data`, preserving all view-local state.
 *
 * This approach requires NO user-side code — the plugin auto-injects the
 * HMR accept/dispose snippet into the compiled template module, similar to
 * how `@vitejs/plugin-react` auto-injects React Refresh.
 */
export function hotSwapByTemplate(
  oldTemplate: ViewTemplate,
  newTemplate: ViewTemplate,
): void {
  if (!oldTemplate || !newTemplate || oldTemplate === newTemplate) return;

  for (const [, frame] of Frame.getAll()) {
    const view = frame.view;
    if (!view || view.template !== oldTemplate) continue;

    // Update the template instance property.
    // View.extend sets template as an instance property in the constructor,
    // so we must overwrite it directly.
    const viewRec = view as unknown as Record<string, unknown>;
    viewRec["template"] = newTemplate;

    // Force a full re-render with the new template + existing data.
    // We bypass the user's render() method (which may reset state) and
    // replicate the render wrapper's side effects instead.
    if (view.signature > 0) {
      view.signature++;
      view.fire("render");
      View.destroyAllResources(view, false);
      view.updater.forceDigest();
    }
  }
}

// ============================================================
// hotSwapByClass — view class HMR (no viewPath needed)
// ============================================================

/**
 * Hot-swap all views whose class matches `oldClass` to use `newClass`, and
 * update the view registry.
 *
 * This is the zero-config HMR primitive used by the **view `.ts` module**.
 * When a `.ts` view file changes, the bundler's HMR system re-executes the
 * module. The auto-injected HMR snippet captures the old class (via dispose)
 * and the new class (via accept), then calls this function.
 *
 * It performs:
 * 1. Registry update: every viewPath whose registered class === oldClass is
 *    updated to newClass (so future synchronous `mountView` calls use the
 *    new class).
 * 2. In-place hot-swap: every mounted frame whose `view instanceof oldClass`
 *    is hot-swapped via `hotSwapView` (prototype swap, template update,
 *    event re-delegation, force-render — all state-preserving).
 */
export function hotSwapByClass(
  oldClass: typeof View,
  newClass: typeof View,
): void {
  if (!oldClass || !newClass || oldClass === newClass) return;

  // 1. Update registry: replace old class entries with new class
  const reg = getViewClassRegistry();
  for (const path in reg) {
    if (reg[path] === oldClass) {
      reg[path] = newClass;
    }
  }

  // 2. Hot-swap all mounted frames using the old class
  for (const [, frame] of Frame.getAll()) {
    const view = frame.view;
    if (view && view instanceof oldClass) {
      hotSwapView(frame, newClass);
    }
  }
}

// ============================================================
// acceptView — View.accept() implementation
// ============================================================

/**
 * Set up the HMR accept handler for a view module.
 *
 * When the module is updated:
 * 1. Extracts the new View class from the new module (default export or module itself)
 * 2. Registers the new class in the view registry
 * 3. Re-mounts all frames currently using this viewPath
 *
 * If the new module doesn't export a valid View class, falls back to
 * `hot.invalidate()` which triggers a full page reload.
 *
 * @param hot - The HMR context (import.meta.hot)
 * @param viewPath - The view path identifier (e.g. 'home')
 */
export function acceptView(hot: HotContext, viewPath: string): void {
  hot.accept((newModule) => {
    // Extract View class: prefer default export, fall back to module itself.
    // Vite passes the new module namespace to the accept callback, so
    // `newModule.default` is the freshly-evaluated View class.
    const candidate = newModule?.default ?? newModule;

    if (typeof candidate === "function") {
      const NewViewClass = candidate as typeof View;
      registerViewClass(viewPath, NewViewClass);
      // Hot-swap in-place: preserves updater.data and other view-local state
      // so e.g. a counter's current value survives the HMR update.
      hotSwapFrames(viewPath, NewViewClass);
      return;
    }

    // webpack / rspack / rsbuild: the accept callback does NOT receive the
    // new module namespace (their `module.hot.accept(cb)` / `import.meta.
    // webpackHot.accept(cb)` semantics differ from Vite). By the time this
    // callback runs the updated module has already re-executed, so if its
    // top-level code called `registerViewClass()` the registry already holds
    // the new class — just hot-swap the mounted frames with it.
    const registered = getViewClass(viewPath);
    if (registered) {
      hotSwapFrames(viewPath, registered);
      return;
    }

    // No new class could be located — cannot handle this update safely.
    hot.invalidate();
  });
}

// ============================================================
// disposeView — View.dispose() implementation
// ============================================================

/**
 * Set up the HMR dispose handler for a view module.
 *
 * When the module is about to be replaced, removes the old View class
 * from the registry so that subsequent `getViewClass` calls don't return
 * the stale class.
 *
 * @param hot - The HMR context (import.meta.hot)
 * @param viewPath - The view path identifier (e.g. 'home')
 */
export function disposeView(hot: HotContext, viewPath: string): void {
  hot.dispose(() => {
    invalidateViewClass(viewPath);
  });
}
