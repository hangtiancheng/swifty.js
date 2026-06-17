/**
 * Shared implementation for the two bookmark columns.
 *
 * Both `views/personal-bookmarks` and `views/work-bookmarks` re-export a
 * View class produced by `createBookmarksView({bucket, counterpart, title})`.
 * Everything below is identical for both columns; only the bucket label
 * and the column heading vary.
 *
 * Virtual scrolling design
 * ------------------------
 *  - Fixed item height (ITEM_HEIGHT) so visible window math is O(1):
 *      startIndex = floor(scrollTop / ITEM_HEIGHT) - OVER_SCAN
 *      endIndex   = startIndex + ceil(viewportH / ITEM_HEIGHT) + 2 * OVER_SCAN
 *  - The scrollable container holds a single relatively-positioned spacer
 *    whose height equals `items.length * ITEM_HEIGHT`. Only rows inside
 *    [startIndex, endIndex) are rendered, each translated to its absolute
 *    Y offset via `transform: translateY(offset)`.
 *  - Scroll events are coalesced into a single rAF; resize is also
 *    rebroadcast through the same path. ResizeObserver tracks the
 *    container itself, which is more reliable than listening on window
 *    when the column resizes due to a sibling layout shift.
 *  - The whole window is held in updater data (`visibleItems`); the
 *    framework's real-DOM diff then patches only the rows that moved.
 */
import { View } from "@lark.js/mvc";
import BaseView from "../view";
import template from "./bookmarks-shared.html";
import useBookmarksStore, {
  filterByBucket,
  type Bookmark,
  type BookmarkBucket,
} from "../store/bookmarks";

export const ITEM_HEIGHT = 44;
const OVER_SCAN = 4;
const DEFAULT_VIEWPORT_HEIGHT = 320;

export interface BookmarksViewSpec {
  bucket: BookmarkBucket;
  counterpart: BookmarkBucket;
  title: string;
}

interface RowVm {
  id: string;
  title: string;
  url: string;
  initial: string;
  offsetY: number;
}

interface ViewState {
  total: number;
  visibleItems: RowVm[];
  spacerHeight: number;
  itemHeight: number;
  editing: boolean;
  adding: boolean;
  searchQuery: string;
}

/**
 * Build the render VM for a single bookmark. The initial letter is
 * precomputed here so the template stays trivial.
 */
function toRowVm(b: Bookmark, offsetY: number): RowVm {
  return {
    id: b.id,
    title: b.title,
    url: b.url,
    initial: (b.title.trim().charAt(0) || "·").toUpperCase(),
    offsetY,
  };
}

/**
 * Compute the visible-window slice given a scroll position and viewport
 * height. Clamps both ends to a valid range and applies over scan padding.
 */
function computeWindow(
  total: number,
  scrollTop: number,
  viewportH: number,
): { start: number; end: number } {
  if (total === 0) return { start: 0, end: 0 };
  const rawStart = Math.floor(scrollTop / ITEM_HEIGHT) - OVER_SCAN;
  const rawEnd = Math.ceil((scrollTop + viewportH) / ITEM_HEIGHT) + OVER_SCAN;
  const start = Math.max(0, rawStart);
  const end = Math.min(total, Math.max(start + 1, rawEnd));
  return { start, end };
}

/**
 * Factory producing the View class for a single bookmark column.
 *
 * The factory shape (rather than a runtime parameter) keeps Lark's view
 * registration model intact: each call site exports its own concrete View
 * subclass, registered under its own view path.
 */
export function createBookmarksView(spec: BookmarksViewSpec): typeof View {
  return BaseView.extend({
    template,

    init() {
      // Per-instance scroll state lives in this closure rather than on the
      // view instance, so we don't have to widen ViewInterface with our
      // implementation details and TypeScript stays strict.
      const ctx: {
        scroller: HTMLDivElement | null;
      } = { scroller: null };

      // Expose ctx to assign() via the view's resources slot so the same
      // captured object is reachable from any handler.
      this.capture("virtual-list-ctx", ctx, false);

      this.assign?.();

      // Re-render whenever the underlying list changes anywhere in the app
      // (the other column moves an item in, a sibling tab tweaks storage
      // and emits a `storage` event we wire up below, etc.).
      const off = useBookmarksStore.subscribe(() => {
        this.assign?.();
        this.updater.digest();
      });
      this.on("destroy", off);

      // Wire scroll + resize observation against the actual DOM container
      // once it's been rendered into the page. We poll on rAF until the
      // [virtual-list-scroll] node appears (one frame at most in practice).
      const recompute = () => {
        this.assign?.();
        this.updater.digest();
      };

      const setupScroll = () => {
        const root = document.getElementById(this.id);
        const scroller = root?.querySelector<HTMLDivElement>(
          "[virtual-list-scroll]",
        );
        if (!root || !scroller) {
          window.requestAnimationFrame(setupScroll);
          return;
        }
        ctx.scroller = scroller;

        let pending = false;
        const onScroll = () => {
          if (pending) return;
          pending = true;
          window.requestAnimationFrame(() => {
            pending = false;
            recompute();
          });
        };
        scroller.addEventListener("scroll", onScroll, { passive: true });

        const ro = new ResizeObserver(() => recompute());
        ro.observe(scroller);

        const onStorage = (e: StorageEvent) => {
          // Cross-tab sync: another tab edited the same key, refresh.
          if (e.key === "lark-index:bookmarks") recompute();
        };
        window.addEventListener("storage", onStorage);

        this.capture(
          "virtual-list-listeners",
          {
            destroy() {
              scroller.removeEventListener("scroll", onScroll);
              ro.disconnect();
              window.removeEventListener("storage", onStorage);
            },
          },
          false,
        );

        // First measurement now that the container is in the DOM.
        recompute();
      };
      window.requestAnimationFrame(setupScroll);
    },

    assign() {
      this.updater.snapshot();
      const store = useBookmarksStore.getState();
      const all = filterByBucket(store.list, spec.bucket);
      const searchQuery = (this.updater.get("searchQuery") as string) || "";
      const filtered = searchQuery
        ? all.filter((b) =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : all;
      const ctx = this.capture("virtual-list-ctx") as
        | { scroller: HTMLDivElement | null }
        | undefined;
      const scroller = ctx?.scroller ?? null;
      const viewportH = scroller?.clientHeight ?? DEFAULT_VIEWPORT_HEIGHT;
      const scrollTop = scroller?.scrollTop ?? 0;
      const { start, end } = computeWindow(
        filtered.length,
        scrollTop,
        viewportH,
      );
      const visibleItems: RowVm[] = [];
      for (let i = start; i < end; i++) {
        visibleItems.push(toRowVm(filtered[i] as Bookmark, i * ITEM_HEIGHT));
      }
      const next: ViewState = {
        total: filtered.length,
        visibleItems,
        spacerHeight: filtered.length * ITEM_HEIGHT,
        itemHeight: ITEM_HEIGHT,
        editing: this.updater.get("editing") === true,
        adding: this.updater.get("adding") === true,
        searchQuery,
      };
      this.updater.set({ ...next, title: spec.title });
      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "toggleEdit<click>"() {
      this.updater
        .set({ editing: this.updater.get("editing") !== true })
        .digest();
    },

    "toggleAdding<click>"() {
      this.updater
        .set({ adding: this.updater.get("adding") !== true })
        .digest();
    },

    "searchBookmarks<input>"(e: Record<string, unknown>) {
      const target = e["eventTarget"] as HTMLInputElement | undefined;
      const query = target?.value ?? "";
      this.updater.set({ searchQuery: query });
      this.assign?.();
      this.updater.digest();
    },

    "addBookmark<click>"(e: Record<string, unknown>) {
      const btn = e["eventTarget"] as HTMLElement | undefined;
      const container = btn?.closest(".flex.flex-col") as
        | HTMLElement
        | undefined;
      if (!container) return;
      const titleInput = container.querySelector<HTMLInputElement>(
        'input[name="title"]',
      );
      const urlInput =
        container.querySelector<HTMLInputElement>('input[name="url"]');
      const title = titleInput?.value.trim() ?? "";
      const url = urlInput?.value.trim() ?? "";
      if (!url) return;
      useBookmarksStore.getState().add({ title, url, bucket: spec.bucket });
      if (titleInput) titleInput.value = "";
      if (urlInput) urlInput.value = "";
      this.updater.set({ adding: false }).digest();
    },

    "exportBookmarks<click>"() {
      const store = useBookmarksStore.getState();
      const items = filterByBucket(store.list, spec.bucket).map((b) => ({
        title: b.title,
        url: b.url,
      }));
      const json = JSON.stringify(items, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks-${spec.bucket}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    "uploadBookmarks<click>"() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".html,.htm,.json";
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const worker = new Worker(
            new URL("./parse-bookmarks.worker.ts", import.meta.url),
            { type: "module" },
          );
          worker.addEventListener(
            "message",
            (
              evt: MessageEvent<{
                bookmarks: Array<{ title: string; url: string }>;
              }>,
            ) => {
              const { bookmarks } = evt.data;
              if (bookmarks.length > 0) {
                useBookmarksStore.getState().bulkAdd(bookmarks, spec.bucket);
                this.updater.set({ adding: false }).digest();
              }
              worker.terminate();
            },
          );
          worker.postMessage({ content });
        };
        reader.readAsText(file);
      });
      input.click();
    },

    "removeBookmark<click>"(e: Record<string, unknown>) {
      const params = (e["params"] ?? {}) as Record<string, string>;
      const id = params["id"];
      if (!id) return;
      useBookmarksStore.getState().remove(id);
    },

    "moveBookmark<click>"(e: Record<string, unknown>) {
      const params = (e["params"] ?? {}) as Record<string, string>;
      const id = params["id"];
      if (!id) return;
      useBookmarksStore.getState().move(id, spec.counterpart);
    },

    "renameBookmark<change>"(e: Record<string, unknown>) {
      const params = (e["params"] ?? {}) as Record<string, string>;
      const id = params["id"];
      const target = e["eventTarget"] as HTMLInputElement | undefined;
      if (!id || !target) return;
      const next = target.value.trim();
      if (!next) return;
      useBookmarksStore.getState().update(id, { title: next });
    },

    "renameKey<keydown>"(e: Record<string, unknown>) {
      const native = e as unknown as KeyboardEvent;
      if (native.key !== "Enter") return;
      native.preventDefault?.();
      const params = (e["params"] ?? {}) as Record<string, string>;
      const id = params["id"];
      const target = e["eventTarget"] as HTMLInputElement | undefined;
      if (!id || !target) return;
      useBookmarksStore.getState().update(id, { title: target.value.trim() });
      target.blur();
    },

    "reUrlBookmark<change>"(e: Record<string, unknown>) {
      const params = (e["params"] ?? {}) as Record<string, string>;
      const id = params["id"];
      const target = e["eventTarget"] as HTMLInputElement | undefined;
      if (!id || !target) return;
      const next = target.value.trim();
      if (!next) return;
      useBookmarksStore.getState().update(id, { url: next });
    },

    "reUrlKey<keydown>"(e: Record<string, unknown>) {
      const native = e as unknown as KeyboardEvent;
      if (native.key !== "Enter") return;
      native.preventDefault?.();
      const params = (e["params"] ?? {}) as Record<string, string>;
      const id = params["id"];
      const target = e["eventTarget"] as HTMLInputElement | undefined;
      if (!id || !target) return;
      useBookmarksStore.getState().update(id, { url: target.value.trim() });
      target.blur();
    },
  });
}
