/**
 * Web Worker: parse bookmarks from Chrome-exported HTML (Netscape Bookmark File)
 * or lark-index exported JSON.
 *
 * Input message: { content: string }
 * Output message: { bookmarks: Array<{ title: string; url: string }> }
 *
 * Format detection is automatic:
 *  - If content starts with `[` or `{`, treat as JSON (lark-index export)
 *  - Otherwise treat as HTML (Chrome Netscape Bookmark File)
 *
 * This runs off the main thread so large bookmark files don't block
 * rendering or scroll interactions.
 */

interface ParsedBookmark {
  title: string;
  url: string;
}

/**
 * Regex-based parser for Netscape Bookmark HTML format.
 * Match all `<DT><A HREF="...">...</A>` patterns.
 */
function parseBookmarksHtml(html: string): ParsedBookmark[] {
  const results: ParsedBookmark[] = [];
  const re = /<A\s[^>]*HREF="([^"]*)"[^>]*>([\s\S]*?)<\/A>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const url = match[1]?.trim();
    const title = (match[2] ?? "").replace(/<[^>]*>/g, "").trim();
    if (url && /^https?:\/\//i.test(url)) {
      results.push({ title: title || url, url });
    }
  }
  return results;
}

/**
 * Parse lark-index exported JSON format.
 * Expects an array of { title: string; url: string } objects.
 */
function parseBookmarksJson(json: string): ParsedBookmark[] {
  try {
    const data = JSON.parse(json);
    const arr = Array.isArray(data) ? data : [];
    const results: ParsedBookmark[] = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const url = typeof item.url === "string" ? item.url.trim() : "";
      const title = typeof item.title === "string" ? item.title.trim() : "";
      if (url && /^https?:\/\//i.test(url)) {
        results.push({ title: title || url, url });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Detect format and dispatch to the appropriate parser.
 */
function parseBookmarks(content: string): ParsedBookmark[] {
  const trimmed = content.trimStart();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseBookmarksJson(content);
  }
  return parseBookmarksHtml(content);
}

self.addEventListener("message", (evt: MessageEvent<{ content: string }>) => {
  const { content } = evt.data;
  const bookmarks = parseBookmarks(content);
  self.postMessage({ bookmarks });
});
