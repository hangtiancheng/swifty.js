/**
 * Template runtime helpers.
 *
 * Compiled templates import these helpers from `@lark.js/mvc/runtime` instead
 * of inlining the implementations. That keeps each compiled `.html` module
 * small — no more ~400 bytes of duplicated helper code per template.
 *
 * The helpers below are aliased to `$strSafe / $encHtml / $encUri / $encQuote /
 * $refFn` inside the IIFE that the compiler produces — see `compiler.ts`.
 */

const HTML_ENT_MAP: Record<string, string> = {
  "&": "amp",
  "<": "lt",
  ">": "gt",
  '"': "#34",
  "'": "#39",
  "`": "#96",
};

const HTML_ENT_REGEXP = /[&<>"`']/g;

/** Null-safe `String(value)` — `null`/`undefined` become `""`. */
export const strSafe = (v: unknown): string => "" + (v == null ? "" : v);

/** HTML-escape a value for safe embedding in markup. */
export const encHtml = (v: unknown): string =>
  strSafe(v).replace(HTML_ENT_REGEXP, (m) => "&" + HTML_ENT_MAP[m] + ";");

const URI_ENT_MAP: Record<string, string> = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
};

const URI_ENT_REGEXP = /[!')(*]/g;

/** Percent-encode a value, with extra characters escaped for stricter URIs. */
export const encUri = (v: unknown): string =>
  encodeURIComponent(strSafe(v)).replace(URI_ENT_REGEXP, (m) => URI_ENT_MAP[m]);

const QUOTE_REGEXP = /['"\\]/g;

/** Backslash-escape quotes and backslashes for attribute string contents. */
export const encQuote = (v: unknown): string =>
  strSafe(v).replace(QUOTE_REGEXP, "\\$&");

/**
 * Look up (or assign) a stable refData token for an object value.
 *
 * Templates use `{{@expr}}` to pass live JS values (objects/functions) through
 * the DOM by writing the token into an attribute, then resolving it back to
 * the original value when the event fires. `refData[SPLITTER]` holds the
 * monotonic counter; `refData[SPLITTER + n]` holds the slot.
 */
export const refFn = (
  ref: Record<string, unknown>,
  value: unknown,
  key: string,
): string => {
  const SPLITTER = String.fromCharCode(0x1e);
  const counter = ref[SPLITTER] as number;
  for (let i = counter; --i; ) {
    key = SPLITTER + i;
    if (ref[key] === value) return key;
  }
  key = SPLITTER + (ref[SPLITTER] as number)++;
  ref[key] = value;
  return key;
};
