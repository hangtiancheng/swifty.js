import { describe, it, expect, beforeEach } from "vitest";
import {
  getViewClass,
  registerViewClass,
  invalidateViewClass,
  getViewClassRegistry,
} from "../src/view-registry";
import { View } from "../src/view";

describe("view-registry", () => {
  beforeEach(() => {
    // Wipe registry between tests
    const reg = getViewClassRegistry();
    for (const key of Object.keys(reg)) {
      invalidateViewClass(key);
    }
  });

  it("registers and looks up a view class by path", () => {
    const A = View.extend({});
    registerViewClass("foo/a", A);
    expect(getViewClass("foo/a")).toBe(A);
  });

  it("strips query parameters from the view path", () => {
    const B = View.extend({});
    registerViewClass("bar/b?x=1", B);
    // Lookup uses path only — the query was stripped on register.
    expect(getViewClass("bar/b")).toBe(B);
    expect(getViewClass("bar/b?x=1")).toBeUndefined();
  });

  it("ignores empty path on registration", () => {
    const C = View.extend({});
    registerViewClass("", C);
    expect(getViewClass("")).toBeUndefined();
  });

  it("invalidate removes a previously registered class", () => {
    const D = View.extend({});
    registerViewClass("baz/d", D);
    invalidateViewClass("baz/d");
    expect(getViewClass("baz/d")).toBeUndefined();
  });

  it("getViewClassRegistry returns the live registry map", () => {
    const E = View.extend({});
    registerViewClass("zzz/e", E);
    const reg = getViewClassRegistry();
    expect(reg["zzz/e"]).toBe(E);
  });
});
