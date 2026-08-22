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

import type { Hook } from "./hooks.ts";

export type Key = string | number;

export interface Props {
  [name: string]: any;
}

/** 函数组件：没有类组件 */
export type ComponentType<P extends Props = Props> = (props: P) => Children;

export type VNodeType = string | ComponentType | symbol;

/** JSX 里允许出现的子节点形态 */
export type Children =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | Children[];

/**
 * type / key / props 是不可变的「描述符」，由 createElement 产出；
 * dom / children / hooks 是「实例」字段，由渲染器在挂载 / 更新时填充。
 *
 * 描述符永远不会被渲染器改写（React 的元素不可变原则），每次 diff 都会
 * 产出新的实例对象，只有 hooks 数组跨渲染共享 —— 组件状态存在那里。
 */
export interface VNode {
  readonly type: VNodeType;
  readonly key: string | null;
  readonly props: Props;
  /** 宿主 DOM；函数组件与 Fragment 自身不产生 DOM，恒为 null */
  dom: Node | null;
  /** 归一化后的子实例；函数组件放的是它的渲染结果 */
  children: VNode[] | null;
  /** 仅函数组件持有，跨渲染保持同一个数组引用 */
  hooks: Hook[] | null;
}

export const Fragment = Symbol.for("swifty.fragment");
export const Text = Symbol.for("swifty.text");

export function createElement(
  type: VNodeType,
  config?: (Props & { key?: Key }) | null,
  ...children: Children[]
): VNode {
  let key: string | null = null;
  const props: Props = {};

  if (config) {
    for (const name of Object.keys(config)) {
      if (name === "key") {
        key = config.key == null ? null : String(config.key);
        continue;
      }
      props[name] = config[name];
    }
  }
  if (children.length > 0) {
    props.children = children.length === 1 ? children[0] : children;
  }

  return { type, key, props, dom: null, children: null, hooks: null };
}

function createTextVNode(nodeValue: string | number): VNode {
  return {
    type: Text,
    key: null,
    props: { nodeValue: String(nodeValue) },
    dom: null,
    children: null,
    hooks: null,
  };
}

/**
 * 归一化子节点：字符串/数字包装成文本 VNode，null / undefined / boolean 丢弃，
 * 嵌套数组拍平。归一化之后同层只有 VNode 一种形态，diff 里不必再分支判断。
 *
 * 注意：拍平时不会改写 key，所以同层的多个数组之间 key 不能重复。
 */
export function toChildArray(
  children: Children,
  target: VNode[] = [],
): VNode[] {
  if (children == null || typeof children === "boolean") {
    return target;
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      toChildArray(child, target);
    }
    return target;
  }
  if (typeof children === "string" || typeof children === "number") {
    target.push(createTextVNode(children));
    return target;
  }
  target.push(children);
  return target;
}
