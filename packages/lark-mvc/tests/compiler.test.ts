import { describe, it, expect } from "vitest";
import { compileTemplate, extractGlobalVars } from "../src/compiler";
import * as runtime from "../src/runtime";

/**
 * Helper: compile + execute a template, returning the rendered string.
 *
 * The compiled module is an ES module that `import`s from `@lark.js/mvc/runtime`.
 * `new Function` cannot evaluate `import` statements, so we strip the import
 * line and inject the runtime helpers as locals instead.
 */
function render(
  source: string,
  data: Record<string, unknown> = {},
  options?: { debug?: boolean; file?: string },
): string {
  const globalVars = extractGlobalVars(source);
  const moduleCode = compileTemplate(source, { ...options, globalVars });

  // Replace the static `import { ... } from "@lark.js/mvc/runtime"` with a
  // destructuring `const`, then turn the `export default function` into a
  // `return function` so `new Function` produces the template.
  const transformed = moduleCode
    .replace(
      /import\s*\{[\s\S]*?\}\s*from\s*["']@lark\.js\/mvc\/runtime["'];?/,
      "const { encHtml: __larkEncHtml, strSafe: __larkStrSafe, encUri: __larkEncUri, encQuote: __larkEncQuote, refFn: __larkRefFn } = __runtime;",
    )
    .replace("export default function", "return function");

  const fn = new Function("__runtime", transformed)(runtime);
  return fn(data, "testViewId", null);
}

describe("compileTemplate", () => {
  describe("{{=}} escaped output", () => {
    it("outputs variable value", () => {
      const result = render("{{=name}}", { name: "hello" });
      expect(result).toBe("hello");
    });

    it("escapes HTML entities", () => {
      const result = render("{{=html}}", { html: "<b>bold</b>" });
      expect(result).toBe("&lt;b&gt;bold&lt;/b&gt;");
    });

    it("null/undefined converted to empty string", () => {
      const result1 = render("{{=val}}", { val: null });
      expect(result1).toBe("");

      const result2 = render("{{=val}}", { val: undefined });
      expect(result2).toBe("");
    });
  });

  describe("{{!}} raw output", () => {
    it("outputs without escaping", () => {
      const result = render("{{!rawHtml}}", { rawHtml: "<b>bold</b>" });
      expect(result).toBe("<b>bold</b>");
    });
  });

  describe("{{forOf}} loop", () => {
    it("basic array iteration", () => {
      const result = render(
        "{{forOf list as item}}<span>{{=item}}</span>{{/forOf}}",
        {
          list: ["a", "b", "c"],
        },
      );
      expect(result).toContain("<span>a</span>");
      expect(result).toContain("<span>b</span>");
      expect(result).toContain("<span>c</span>");
    });

    it("array iteration with index", () => {
      const result = render(
        "{{forOf list as item idx}}[{{=idx}}:{{=item}}]{{/forOf}}",
        {
          list: ["x", "y"],
        },
      );
      expect(result).toContain("[0:x]");
      expect(result).toContain("[1:y]");
    });

    it("nested loops", () => {
      const result = render(
        "{{forOf outer as o}}{{forOf o as v}}{{=v}}{{/forOf}}{{/forOf}}",
        {
          outer: [
            [1, 2],
            [3, 4],
          ],
        },
      );
      expect(result).toContain("1");
      expect(result).toContain("2");
      expect(result).toContain("3");
      expect(result).toContain("4");
    });
  });

  describe("{{if}} / {{else}} / {{else if}} conditionals", () => {
    it("if condition is true", () => {
      const result = render("{{if show}}visible{{/if}}", { show: true });
      expect(result).toBe("visible");
    });

    it("if condition is false", () => {
      const result = render("{{if show}}visible{{/if}}", { show: false });
      expect(result).toBe("");
    });

    it("if / else", () => {
      const result = render("{{if active}}on{{else}}off{{/if}}", {
        active: false,
      });
      expect(result).toBe("off");
    });

    it("if / else if / else", () => {
      const result1 = render(
        "{{if level > 2}}high{{else if level > 0}}mid{{else}}low{{/if}}",
        {
          level: 3,
        },
      );
      expect(result1).toBe("high");

      const result2 = render(
        "{{if level > 2}}high{{else if level > 0}}mid{{else}}low{{/if}}",
        {
          level: 1,
        },
      );
      expect(result2).toBe("mid");

      const result3 = render(
        "{{if level > 2}}high{{else if level > 0}}mid{{else}}low{{/if}}",
        {
          level: 0,
        },
      );
      expect(result3).toBe("low");
    });

    it("complex conditional expressions", () => {
      const result = render("{{if a && b || c}}yes{{/if}}", {
        a: true,
        b: false,
        c: true,
      });
      expect(result).toBe("yes");
    });
  });

  describe("{{forIn}} object iteration", () => {
    it("iterates over object properties", () => {
      const result = render(
        "{{forIn obj as val key}}[{{=key}}:{{=val}}]{{/forIn}}",
        {
          obj: { x: 1, y: 2 },
        },
      );
      expect(result).toContain("[x:1]");
      expect(result).toContain("[y:2]");
    });
  });

  describe("{{for}} for loop", () => {
    it("standard for loop", () => {
      const result = render("{{for(let i=0;i<3;i++)}}{{=i}}{{/for}}", {});
      expect(result).toContain("0");
      expect(result).toContain("1");
      expect(result).toContain("2");
    });
  });

  describe("{{set}} variable declaration", () => {
    it("declares variables and uses them", () => {
      const result = render("{{set a=20,b=30}}{{=a}}-{{=b}}", {});
      expect(result).toBe("20-30");
    });
  });

  describe("@event attribute handling", () => {
    it("@click event binding", () => {
      const result = render('<div @click="handlerName()">click</div>', {});
      // @event attribute should include viewId prefix
      expect(result).toContain("@click=");
      expect(result).toContain("handlerName()");
    });

    it("@click with arguments", () => {
      const result = render(
        "<div @click=\"handlerName({key: 'value'})\">click</div>",
        {},
      );
      expect(result).toContain("@click=");
      expect(result).toContain("handlerName(");
    });
  });

  describe("HTML comment protection", () => {
    it("template syntax inside comments is not transformed", () => {
      const result = render("<!-- {{=shouldNotRender}} --><p>{{=text}}</p>", {
        text: "visible",
        shouldNotRender: "hidden",
      });
      expect(result).toContain("visible");
      // Comment content should remain unchanged
      expect(result).toContain("shouldNotRender");
    });
  });

  describe("viewId injection", () => {
    it("\\x1f placeholder in template replaced with viewId", () => {
      const result = render('<div @click="handler()">text</div>', {});
      // viewId "testViewId" should appear in output
      expect(result).toContain("testViewId");
    });
  });

  describe("debug mode", () => {
    it("compiles successfully in debug mode", () => {
      const moduleCode = compileTemplate("{{=name}}", { debug: true });
      expect(moduleCode).toContain("export default function");
    });
  });

  describe("error handling", () => {
    it("unclosed block throws error", () => {
      expect(() => {
        compileTemplate("{{if true}}never closed");
      }).toThrow();
    });

    it("mismatched block closing throws error", () => {
      expect(() => {
        compileTemplate("{{if true}}text{{/forOf}}");
      }).toThrow();
    });

    it("excess block closing throws error", () => {
      expect(() => {
        compileTemplate("{{/if}}");
      }).toThrow();
    });
  });

  describe("miscellaneous", () => {
    it("pure HTML output as-is", () => {
      const result = render("<div>hello</div>");
      expect(result).toBe("<div>hello</div>");
    });

    it("empty template outputs empty string", () => {
      const result = render("");
      expect(result).toBe("");
    });

    it("function call output", () => {
      // `fn` as a CallExpression callee is excluded by extractGlobalVars,
      // so the test passes globalVars manually.
      const moduleCode = compileTemplate("{{=fn(a,b,c)}}", {
        globalVars: ["fn", "a", "b", "c"],
      });
      const transformed = moduleCode
        .replace(
          /import\s*\{[\s\S]*?\}\s*from\s*["']@lark\.js\/mvc\/runtime["'];?/,
          "const { encHtml: __larkEncHtml, strSafe: __larkStrSafe, encUri: __larkEncUri, encQuote: __larkEncQuote, refFn: __larkRefFn } = __runtime;",
        )
        .replace("export default function", "return function");
      const fn = new Function("__runtime", transformed)(runtime);
      const result = fn(
        {
          fn: (a: number, b: number, c: number) => a + b + c,
          a: 1,
          b: 2,
          c: 3,
        },
        "testViewId",
        null,
      );
      expect(result).toBe("6");
    });
  });
});

describe("extractGlobalVars", () => {
  it("extracts global variables used in template", () => {
    const vars = extractGlobalVars("{{=name}}-{{=age}}");
    expect(vars).toContain("name");
    expect(vars).toContain("age");
  });

  it("extracts variables from each loop", () => {
    const vars = extractGlobalVars("{{forOf list as item}}{{=item}}{{/forOf}}");
    expect(vars).toContain("list");
  });

  it("extracts variables from if condition", () => {
    const vars = extractGlobalVars("{{if visible}}show{{/if}}");
    expect(vars).toContain("visible");
  });

  it("does not extract built-in global variables", () => {
    const vars = extractGlobalVars("{{=Math.round(val)}}");
    // Math is built-in global, should not be extracted
    expect(vars).not.toContain("Math");
    expect(vars).toContain("val");
  });

  it("does not extract local variables declared in {{set}}", () => {
    const vars = extractGlobalVars("{{set localVar=10}}{{=localVar}}");
    // localVar is a local variable, should not be extracted
    expect(vars).not.toContain("localVar");
  });

  it("empty template returns empty array", () => {
    const vars = extractGlobalVars("<div>plain html</div>");
    expect(vars).toEqual([]);
  });
});
