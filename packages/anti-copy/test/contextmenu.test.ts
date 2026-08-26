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
  document.body.innerHTML = "";
});

function fireContextmenu(target: EventTarget): Event {
  const event = new Event("contextmenu", { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe("contextmenu", () => {
  it("suppresses the context menu and reports the violation", () => {
    const onViolation = vi.fn();
    instance = createAntiCopy({ selectStyle: false, onViolation });
    instance.enable();
    const event = fireContextmenu(document.body);
    expect(event.defaultPrevented).toBe(true);
    expect(onViolation).toHaveBeenCalledWith(expect.objectContaining({ type: "contextmenu" }));
  });

  it("keeps the native menu inside editable controls", () => {
    document.body.innerHTML = "<input id='i' /><div contenteditable='true' id='e'>x</div>";
    instance = createAntiCopy({ selectStyle: false });
    instance.enable();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireContextmenu(document.getElementById("i")!).defaultPrevented,
    ).toBe(false);
    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireContextmenu(document.getElementById("e")!).defaultPrevented,
    ).toBe(false);
  });

  it("keeps the native menu inside excluded regions", () => {
    document.body.innerHTML = '<div class="allowed"><p id="p">x</p></div>';
    instance = createAntiCopy({
      selectStyle: false,
      excludeSelectors: [".allowed"],
    });
    instance.enable();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      fireContextmenu(document.getElementById("p")!).defaultPrevented,
    ).toBe(false);
  });

  it("does not attach when contextmenu is disabled", () => {
    instance = createAntiCopy({ selectStyle: false, contextmenu: false });
    instance.enable();
    expect(fireContextmenu(document.body).defaultPrevented).toBe(false);
  });
});
