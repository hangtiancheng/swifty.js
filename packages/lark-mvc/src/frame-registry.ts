/**
 * Frame instance registry.
 *
 * Extracted from `frame.ts` so that `updater.ts` and `hmr.ts` can look up
 * frames without importing the `Frame` class itself. Previously both modules
 * did `import { Frame } from "./frame"`, which produced two rollup circular
 * dependency warnings:
 *
 *   frame.ts -> view.ts -> updater.ts -> frame.ts
 *   frame.ts -> view.ts -> hmr.ts     -> frame.ts
 *
 * `frame.ts` owns the `Frame` class and mutates this registry; other modules
 * read from it via the getters below. This module depends only on
 * `FrameInterface` (a type) from `./types`, so no runtime cycle is created.
 */
import type { FrameInterface } from "./types";

// ============================================================
// Registry state
// ============================================================

/** All frames registry: id -> Frame */
const frameRegistry = new Map<string, FrameInterface>();

// ============================================================
// Accessors
// ============================================================

/**
 * Look up a Frame by its DOM id.
 * Returns `undefined` when no frame is registered for `id`.
 */
export function getFrame(id: string): FrameInterface | undefined {
  return frameRegistry.get(id);
}

/**
 * Get the full frame registry.
 *
 * Returns the live `Map` so callers can iterate or read `size`. Mutations
 * should go through `registerFrame` / `removeFrame` to keep the registry
 * consistent with `Frame` lifecycle events.
 */
export function getAllFrames(): Map<string, FrameInterface> {
  return frameRegistry;
}

/**
 * Register a frame under its id.
 * Called by the `Frame` constructor and by `reInitFrame` on cache reuse.
 */
export function registerFrame(id: string, frame: FrameInterface): void {
  frameRegistry.set(id, frame);
}

/**
 * Remove a frame from the registry.
 * Called by `removeFrame` during `unmountFrame` cleanup.
 */
export function removeFrame(id: string): void {
  frameRegistry.delete(id);
}
