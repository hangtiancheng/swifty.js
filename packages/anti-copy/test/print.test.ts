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

import { afterEach, describe, expect, it, vi } from "vitest";
import { createAntiCopy, type AntiCopyInstance } from "@/index";

let instance: AntiCopyInstance | null = null;

afterEach(() => {
  instance?.destroy();
  instance = null;
});

describe("print protection", () => {
  it("injects an @media print stylesheet and removes it on disable", () => {
    instance = createAntiCopy({ selectStyle: false });
    instance.enable();
    const style = document.head.querySelector("style[swifty-anti-print]");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain("@media print");
    expect(style?.textContent).toContain("display: none !important");
    instance.disable();
    expect(document.head.querySelector("style[swifty-anti-print]")).toBeNull();
  });

  it("reports print attempts via beforeprint", () => {
    const onViolation = vi.fn();
    instance = createAntiCopy({ selectStyle: false, onViolation });
    instance.enable();
    window.dispatchEvent(new Event("beforeprint"));
    expect(onViolation).toHaveBeenCalledWith({ type: "print" });
  });

  it("does nothing when print is disabled", () => {
    const onViolation = vi.fn();
    instance = createAntiCopy({
      selectStyle: false,
      print: false,
      onViolation,
    });
    instance.enable();
    expect(document.head.querySelector("style[swifty-anti-print]")).toBeNull();
    window.dispatchEvent(new Event("beforeprint"));
    expect(onViolation).not.toHaveBeenCalled();
  });
});
