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

import { Text } from "./element.ts";
import type { Props, VNode } from "./element.ts";

const ATTRIBUTE_ALIAS: Record<string, string> = {
  className: "class",
  htmlFor: "for",
};

function isEventName(name: string): boolean {
  return (
    name.length > 2 &&
    name.startsWith("on") &&
    name[2] === name[2].toUpperCase()
  );
}

function eventTypeOf(name: string): string {
  return name.slice(2).toLowerCase();
}

export function createDom(vNode: VNode): Node {
  if (vNode.type === Text) {
    return document.createTextNode(vNode.props.nodeValue);
  }
  const dom = document.createElement(vNode.type as string);
  updateProps(dom, {}, vNode.props);
  return dom;
}

/** Incrementally update props: remove stale ones first, then skip unchanged ones via Object.is */
export function updateProps(
  dom: Element,
  oldProps: Props,
  newProps: Props,
): void {
  for (const name of Object.keys(oldProps)) {
    if (name === "children" || name in newProps) {
      continue;
    }
    if (isEventName(name)) {
      dom.removeEventListener(eventTypeOf(name), oldProps[name]);
      continue;
    }
    dom.removeAttribute(ATTRIBUTE_ALIAS[name] ?? name);
  }

  for (const name of Object.keys(newProps)) {
    if (name === "children") {
      continue;
    }
    const next = newProps[name];
    const prev = oldProps[name];
    if (Object.is(prev, next)) {
      continue;
    }
    if (isEventName(name)) {
      const eventType = eventTypeOf(name);
      if (prev) {
        dom.removeEventListener(eventType, prev);
      }
      if (next) {
        dom.addEventListener(eventType, next);
      }
      continue;
    }
    if (name === "style") {
      applyStyle(dom as HTMLElement, prev, next);
      continue;
    }
    setProp(dom, name, next);
  }
}

function setProp(dom: Element, name: string, value: unknown): void {
  const attribute = ATTRIBUTE_ALIAS[name];
  if (attribute !== undefined) {
    if (value === null || value === undefined) {
      dom.removeAttribute(attribute);
    } else {
      dom.setAttribute(attribute, String(value));
    }
    return;
  }
  // Controlled properties like value / checked only reflect in the UI when written as properties
  if (name in dom) {
    // dom[name] = value === null || value === undefined ? "" : value;
    Reflect.set(dom, name, value === null || value === undefined ? "" : value);
    return;
  }
  if (value === null || value === undefined || value === false) {
    dom.removeAttribute(name);
    return;
  }
  dom.setAttribute(name, value === true ? "" : String(value));
}

type StyleValue = string | Record<string, string> | null | undefined;

function applyStyle(
  dom: HTMLElement,
  prev: StyleValue,
  next: StyleValue,
): void {
  if (next === null || next === undefined) {
    dom.style.cssText = "";
    return;
  }
  if (typeof next === "string") {
    dom.style.cssText = next;
    return;
  }
  if (typeof prev === "string") {
    dom.style.cssText = "";
  }
  if (prev && typeof prev === "object") {
    for (const name of Object.keys(prev)) {
      if (!(name in next)) {
        // dom.style[name] = "";
        Reflect.set(dom.style, name, "");
      }
    }
  }
  for (const name of Object.keys(next)) {
    if (
      typeof prev !== "object" ||
      prev === null ||
      prev[name] !== next[name]
    ) {
      // dom.style[name] = next[name];
      Reflect.set(dom.style, name, next[name]);
    }
  }
}
