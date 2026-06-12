/**
 * Bookmarks store.
 *
 * Single store, two buckets ("personal" / "work"). Both columns share the
 * same list and the same CRUD surface, which keeps move-between-buckets a
 * single-key mutation rather than a cross-store transfer.
 *
 * Persistence: localStorage["lark-index:bookmarks"]. The whole list is
 * re-serialized on every mutation; expected sizes are hundreds at most, so
 * the JSON.stringify cost is negligible compared to a DOM repaint.
 */
import { create } from "@lark.js/mvc";
import { z } from "zod";

export type BookmarkBucket = "personal" | "work" | "read-list";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  bucket: BookmarkBucket;
  createdAt: number;
  updatedAt: number;
}

export interface BookmarksStore {
  list: Bookmark[];
  add: (input: { title: string; url: string; bucket: BookmarkBucket }) => void;
  bulkAdd: (
    items: Array<{ title: string; url: string }>,
    bucket: BookmarkBucket,
  ) => void;
  remove: (id: string) => void;
  update: (id: string, patch: { title?: string; url?: string }) => void;
  move: (id: string, target: BookmarkBucket) => void;
  reset: () => void;
}

const STORAGE_KEY = "lark-index:bookmarks";

const BookmarkSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    bucket: z.enum(["personal", "work", "read-list"]),
    createdAt: z.number(),
    updatedAt: z.number().optional(),
  })
  .transform((o) => ({
    ...o,
    updatedAt: o.updatedAt ?? o.createdAt,
  }));

function coerceBookmark(x: unknown): Bookmark | undefined {
  const result = BookmarkSchema.safeParse(x);
  return result.success ? result.data : undefined;
}

function loadFromStorage(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: Bookmark[] = [];
    for (const item of parsed) {
      const b = coerceBookmark(item);
      if (b) out.push(b);
    }
    return out;
  } catch (e) {
    console.warn("[@lark.js/index] bookmarks: load failed:", e);
    return [];
  }
}

function persist(list: readonly Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("[@lark.js/index] bookmarks: persist failed:", e);
  }
}

function genId(): string {
  return `bm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const useBookmarksStore = create<BookmarksStore>("bookmarks", (set, get) => ({
  list: loadFromStorage(),

  add(input) {
    const url = normalizeUrl(input.url);
    if (!url) return;
    const title = input.title.trim() || deriveTitleFromUrl(url);
    const now = Date.now();
    const next: Bookmark = {
      id: genId(),
      title,
      url,
      bucket: input.bucket,
      createdAt: now,
      updatedAt: now,
    };
    const list = [...get().list, next];
    set({ list });
    persist(list);
  },

  bulkAdd(items, bucket) {
    if (!items.length) return;
    const now = Date.now();
    const newEntries: Bookmark[] = items
      .map((item, idx) => {
        const url = normalizeUrl(item.url);
        if (!url) return null;
        const title = item.title.trim() || deriveTitleFromUrl(url);
        return {
          id: genId() + idx.toString(36),
          title,
          url,
          bucket,
          createdAt: now + idx,
          updatedAt: now + idx,
        } as Bookmark;
      })
      .filter(Boolean) as Bookmark[];
    if (!newEntries.length) return;
    const list = [...get().list, ...newEntries];
    set({ list });
    persist(list);
  },

  remove(id) {
    const list = get().list.filter((b) => b.id !== id);
    if (list.length === get().list.length) return;
    set({ list });
    persist(list);
  },

  update(id, patch) {
    let touched = false;
    const list = get().list.map((b) => {
      if (b.id !== id) return b;
      const nextTitle =
        patch.title !== undefined ? patch.title.trim() || b.title : b.title;
      const nextUrl =
        patch.url !== undefined ? normalizeUrl(patch.url) || b.url : b.url;
      if (nextTitle === b.title && nextUrl === b.url) return b;
      touched = true;
      return { ...b, title: nextTitle, url: nextUrl, updatedAt: Date.now() };
    });
    if (!touched) return;
    set({ list });
    persist(list);
  },

  move(id, target) {
    let touched = false;
    const list = get().list.map((b) => {
      if (b.id !== id || b.bucket === target) return b;
      touched = true;
      return { ...b, bucket: target, updatedAt: Date.now() };
    });
    if (!touched) return;
    set({ list });
    persist(list);
  },

  reset() {
    set({ list: [] });
    persist([]);
  },
}));

export default useBookmarksStore;

export function filterByBucket(
  list: readonly Bookmark[],
  bucket: BookmarkBucket,
): Bookmark[] {
  return list
    .filter((b) => b.bucket === bucket)
    .sort((a, b) => a.createdAt - b.createdAt);
}

function deriveTitleFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || url;
  } catch {
    return url;
  }
}
