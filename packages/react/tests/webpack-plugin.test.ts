/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { describe, expect, it } from "vitest";
import { LarkReactPlugin, larkReactLoader } from "@lark.js/react/webpack";

interface Rule {
  test: RegExp;
  exclude: RegExp;
  enforce: string;
  use: Array<{ loader: string }>;
}

function makeCompiler(mode?: string): {
  options: { mode?: unknown; module: { rules: unknown[] } };
} {
  return { options: { mode, module: { rules: [] } } };
}

const component = `export default function App() { return null; }\n`;

describe("LarkReactPlugin", () => {
  it("pushes a single enforce-pre loader rule", () => {
    const compiler = makeCompiler("development");
    new LarkReactPlugin().apply(compiler);

    expect(compiler.options.module.rules).toHaveLength(1);
    const rule = compiler.options.module.rules[0] as Rule;
    expect(rule.enforce).toBe("pre");
    expect(rule.test.test("app.tsx")).toBe(true);
    expect(rule.test.test("app.jsx")).toBe(true);
    expect(rule.test.test("app.ts")).toBe(false);
    expect(rule.exclude.test("/node_modules/dep/app.tsx")).toBe(true);
    expect(rule.use).toHaveLength(1);
    expect(rule.use[0].loader).toMatch(/webpack\.(ts|js|cjs)$/);
  });

  it("skips production builds", () => {
    const compiler = makeCompiler("production");
    new LarkReactPlugin().apply(compiler);
    expect(compiler.options.module.rules).toHaveLength(0);
  });

  it("respects custom test/exclude options", () => {
    const compiler = makeCompiler("development");
    new LarkReactPlugin({ test: /\.custom$/, exclude: /vendor/ }).apply(compiler);
    const rule = compiler.options.module.rules[0] as Rule;
    expect(rule.test.test("app.custom")).toBe(true);
    expect(rule.test.test("app.tsx")).toBe(false);
    expect(rule.exclude.test("/vendor/x.custom")).toBe(true);
  });
});

describe("larkReactLoader", () => {
  it("injects the webpack HMR snippet into default-export sources", () => {
    const output = larkReactLoader.call({}, component);
    expect(output).toContain("__lark_react_component__");
    expect(output).toContain("import.meta.webpackHot");
  });

  it("passes through sources without a default export", () => {
    const source = `export const x = 1;\n`;
    expect(larkReactLoader.call({}, source)).toBe(source);
  });

  it("is a no-op in production mode", () => {
    expect(larkReactLoader.call({ mode: "production" }, component)).toBe(component);
  });
});
