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
import { createRoot, render } from "@lark.js/react";
import { createContainer } from "./helpers";

describe("render", () => {
  it("mounts host elements, text, numbers and nested components", () => {
    const container = createContainer();
    function Title(props: { text: string }) {
      return <h1>{props.text}</h1>;
    }
    render(
      <main id="app">
        <Title text="hello" />
        {"world"}
        {42}
      </main>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<main id="app"><h1>hello</h1>world42</main>',
    );
  });

  it("flattens fragments and arrays without wrapper elements", () => {
    const container = createContainer();
    render(
      <div>
        <>
          <span>a</span>
          <span>b</span>
        </>
        {[<i key="x">x</i>, <i key="y">y</i>]}
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      "<div><span>a</span><span>b</span><i>x</i><i>y</i></div>",
    );
  });

  it("skips null, undefined and boolean children", () => {
    const container = createContainer();
    render(
      <div>
        {null}
        {undefined}
        {false}
        {true}
        <b>kept</b>
      </div>,
      container,
    );
    expect(container.innerHTML).toBe("<div><b>kept</b></div>");
  });

  it("updates in place on re-render and unmounts via render(null)", () => {
    const container = createContainer();
    render(<p title="one">first</p>, container);
    const p = container.firstChild;
    render(<p title="two">second</p>, container);
    expect(container.firstChild).toBe(p);
    expect(container.innerHTML).toBe('<p title="two">second</p>');
    render(null, container);
    expect(container.innerHTML).toBe("");
  });

  it("replaces the subtree when the element type changes", () => {
    const container = createContainer();
    render(<span>x</span>, container);
    const span = container.firstChild;
    render(<em>x</em>, container);
    expect(container.innerHTML).toBe("<em>x</em>");
    expect(container.firstChild).not.toBe(span);
  });

  it("supports the createRoot API", () => {
    const container = createContainer();
    const root = createRoot(container);
    root.render(<div>rooted</div>);
    expect(container.innerHTML).toBe("<div>rooted</div>");
    root.unmount();
    expect(container.innerHTML).toBe("");
    root.render(<div>again</div>);
    expect(container.innerHTML).toBe("<div>again</div>");
  });

  it("renders components returning plain strings and arrays", () => {
    const container = createContainer();
    function Words() {
      return ["a", "b"];
    }
    function Plain() {
      return "text";
    }
    render(
      <div>
        <Words />
        <Plain />
      </div>,
      container,
    );
    expect(container.innerHTML).toBe("<div>abtext</div>");
  });
});
