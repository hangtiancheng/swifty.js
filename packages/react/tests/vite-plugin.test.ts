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
import type { UserConfig } from "vite";
import {
  injectComponentHmrSnippet,
  larkReactPlugin,
} from "@lark.js/react/vite";

function callConfig(userConfig: UserConfig): UserConfig | undefined {
  const plugin = larkReactPlugin();
  const config = plugin.config as (
    config: UserConfig,
    env: { command: string; mode: string },
  ) => UserConfig | undefined;
  return config(userConfig, { command: "serve", mode: "development" });
}

function callTransform(
  code: string,
  id: string,
  command: "serve" | "build" = "serve",
): unknown {
  const plugin = larkReactPlugin();
  const configResolved = plugin.configResolved as (config: {
    command: string;
  }) => void;
  configResolved({ command });
  const transform = plugin.transform as (
    code: string,
    id: string,
  ) => { code: string; map: null } | undefined;
  return transform(code, id);
}

describe("injectComponentHmrSnippet", () => {
  it("keeps named function declarations and appends the alias + snippet", () => {
    const source = `export default function App() {\n  return null;\n}\n`;
    const output = injectComponentHmrSnippet(source);
    expect(output).toContain("function App() {");
    expect(output).not.toContain("export default function");
    expect(output).toContain("const __lark_react_component__ = App;");
    expect(output).toContain("export default __lark_react_component__;");
    expect(output).toContain("import.meta.hot.accept");
    expect(output).toContain(
      "globalThis.__lark_react_hmr__?.hotSwapByComponent",
    );
  });

  it("const-wraps identifier and arrow default exports", () => {
    const source = `const App = () => null;\nexport default App;\n`;
    const output = injectComponentHmrSnippet(source);
    expect(output).toContain("const __lark_react_component__ = App;");
    expect(output).toContain("export default __lark_react_component__;");
    expect(output).toContain("import.meta.hot.dispose");
  });

  it("is idempotent and leaves sources without a default export unchanged", () => {
    const source = `export default function App() { return null; }\n`;
    const once = injectComponentHmrSnippet(source);
    expect(injectComponentHmrSnippet(once)).toBe(once);

    const named = `export function util() {}\n`;
    expect(injectComponentHmrSnippet(named)).toBe(named);
  });

  it("ignores commented-out default exports", () => {
    const source = `// export default App\nexport const x = 1;\n`;
    expect(injectComponentHmrSnippet(source)).toBe(source);
  });
});

describe("larkReactPlugin.config", () => {
  it("defaults the esbuild JSX transform to the lark automatic runtime", () => {
    expect(callConfig({})).toEqual({
      esbuild: { jsx: "automatic", jsxImportSource: "@lark.js/react" },
    });
  });

  it("respects user-provided jsx settings", () => {
    expect(callConfig({ esbuild: { jsx: "preserve" } })).toBe(undefined);
    expect(callConfig({ esbuild: false })).toBe(undefined);
    expect(callConfig({ esbuild: { jsxImportSource: "custom" } })).toEqual({
      esbuild: { jsx: "automatic" },
    });
    expect(
      callConfig({
        esbuild: { jsx: "automatic", jsxImportSource: "custom" },
      }),
    ).toBe(undefined);
  });
});

describe("larkReactPlugin.transform", () => {
  const component = `export default function App() { return null; }\n`;

  it("injects into .tsx/.jsx modules during dev", () => {
    const result = callTransform(component, "/src/app.tsx") as {
      code: string;
      map: null;
    };
    expect(result.code).toContain("__lark_react_component__");
    expect(result.map).toBe(null);
    expect(callTransform(component, "/src/app.jsx")).toBeDefined();
  });

  it("skips builds, node_modules, non-JSX ids and no-op sources", () => {
    expect(callTransform(component, "/src/app.tsx", "build")).toBe(undefined);
    expect(callTransform(component, "/node_modules/dep/app.tsx")).toBe(
      undefined,
    );
    expect(callTransform(component, "/src/app.ts")).toBe(undefined);
    expect(callTransform("export const x = 1;\n", "/src/app.tsx")).toBe(
      undefined,
    );
  });

  it("strips query suffixes before matching the extension", () => {
    expect(callTransform(component, "/src/app.tsx?v=123")).toBeDefined();
    expect(callTransform(component, "/src/app.ts?import")).toBe(undefined);
  });
});
