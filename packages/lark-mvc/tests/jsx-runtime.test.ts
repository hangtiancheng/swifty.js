import { describe, it, expect } from "vitest";
import { jsx, jsxs, jsxDEV, Fragment } from "../src/jsx-runtime";
import { vdomCreate } from "../src/vdom";
import { V_TEXT_NODE } from "../src/common";
import type { VDomNode } from "../src/types";

describe("JSX Runtime", () => {
  describe("jsx — element creation", () => {
    it("creates a simple element with no children", () => {
      const node = jsx("div", { class: "test" });
      expect(node).toBeDefined();
      expect(node.tag).toBe("div");
    });

    it("creates an element with text child", () => {
      const node = jsx("div", { children: "hello" });
      expect(node).toBeDefined();
      expect(node.tag).toBe("div");
      expect(node.html).toContain("hello");
    });

    it("creates an element with element child", () => {
      const child = jsx("span", {});
      const node = jsx("div", { children: child });
      expect(node.tag).toBe("div");
      expect(node.children).toBeDefined();
    });

    it("creates an element with multiple children", () => {
      const child1 = jsx("span", { children: "a" });
      const child2 = jsx("span", { children: "b" });
      const node = jsx("div", { children: [child1, child2] });
      expect(node.tag).toBe("div");
      expect(node.children).toBeDefined();
    });

    it("passes attributes through to vdomCreate", () => {
      const node = jsx("div", { class: "row", id: "main" });
      expect(node.tag).toBe("div");
      expect(node.attrs).toContain('class="row"');
      expect(node.attrs).toContain('id="main"');
    });

    it("handles numeric children by converting to text", () => {
      const node = jsx("div", { children: 42 });
      expect(node.tag).toBe("div");
      expect(node.html).toContain("42");
    });

    it("skips boolean/null/undefined children", () => {
      const node = jsx("div", {
        children: [true, false, null, undefined, "text"],
      });
      expect(node.tag).toBe("div");
      // Only "text" should survive
      expect(node.html).toContain("text");
    });

    it("handles key prop", () => {
      const node = jsx("li", { children: "item", key: "k1" }, "k1");
      expect(node.tag).toBe("li");
      // key should be stored as data-lark-key
      expect(node.attrs).toContain("data-lark-key");
    });
  });

  describe("jsxs — static children", () => {
    it("behaves like jsx for arrays", () => {
      const children = [jsx("span", {}), jsx("span", {})];
      const node = jsxs("div", { children });
      expect(node.tag).toBe("div");
      expect(node.children).toBeDefined();
    });
  });

  describe("jsxDEV — development mode", () => {
    it("strips __source and __self and delegates to jsx", () => {
      const node = jsxDEV(
        "div",
        { class: "dev", children: "test", __source: {}, __self: {} },
        undefined,
        false,
        {},
        {},
      );
      expect(node.tag).toBe("div");
      expect(node.html).toContain("test");
    });
  });

  describe("Fragment", () => {
    it("renders single child without wrapper", () => {
      const child = jsx("span", { children: "inner" });
      const result = jsx(Fragment, { children: child });
      expect(result).toBe(child);
    });

    it("renders empty fragment as empty text node", () => {
      const result = jsx(Fragment, {});
      expect(result.tag).toBe(V_TEXT_NODE);
      expect(result.html).toBe("");
    });
  });

  describe("JSX namespace types", () => {
    it("VDomNode is the JSX.Element type", () => {
      const node: VDomNode = vdomCreate("div", null, 1);
      // This assignment compiles because JSX.Element = VDomNode
      const _element: VDomNode = node;
      expect(_element).toBe(node);
    });
  });
});
