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

import { createDom, updateProps } from "./dom.ts";
import { Text, toChildArray } from "./element.ts";
import type { VNode } from "./element.ts";
import {
  flushEffects,
  renderComponent,
  setActiveRoot,
  teardownEffects,
} from "./hooks.ts";
import type { Root } from "./hooks.ts";

/**
 * 渲染一个根：diff 出新实例树并同步提交，然后统一执行 effect。
 * 不可中断 —— 一次调用从头走到尾。
 */
export function renderRoot(root: Root): void {
  setActiveRoot(root);
  root.children = diffChildren(
    root.container,
    root.children,
    toChildArray(root.element),
    null,
  );
  setActiveRoot(null);
  flushEffects(root.children);
}

/**
 * 同层子节点 diff，React 的三条前提（把 O(n^3) 压到 O(n)）：
 *   1. 只比较同层，跨层级移动一律按「卸载 + 新建」处理；
 *   2. type 变了就认为整棵子树不可复用；
 *   3. key 用来在同层内标识「同一个节点」，没有 key 时退化成按下标比较。
 *
 * 分两轮：第一轮从左到右按位比较，遇到第一个 key 失配就停；第二轮把剩下的
 * 旧节点塞进 key -> 下标 的 Map，按新列表顺序取用。两轮共用 lastPlacedIndex
 * 这条水位线判断复用的节点要不要移动位置。
 *
 * @param parentDom   这些子节点所在的宿主父节点
 * @param oldChildren 上一次的子实例（带着 dom / hooks）
 * @param newChildren 归一化后的新描述符
 * @param anchor      这一段子节点右侧紧邻的宿主节点，null 表示排到末尾
 * @returns 新的子实例列表
 */
export function diffChildren(
  parentDom: Node,
  oldChildren: VNode[],
  newChildren: VNode[],
  anchor: Node | null,
): VNode[] {
  /** 每个新节点匹配到的旧实例，null 表示要新建 */
  const matched: (VNode | null)[] = new Array(newChildren.length).fill(null);
  /** 复用之后是否还需要移动位置 */
  const moved: boolean[] = new Array(newChildren.length).fill(false);
  /** 没能被复用、需要卸载的旧实例 */
  const removals: VNode[] = [];

  // 已复用且保持原有相对顺序的旧节点里，最大的旧下标
  let lastPlacedIndex = 0;
  let index = 0;

  // 第一轮：按位比较。尾部增删、纯 props 更新这类最常见的改动在这里走完，
  // 不必建 Map。这一轮里新旧下标相等，复用到的节点都不用移动。
  for (; index < oldChildren.length && index < newChildren.length; index++) {
    const oldChild = oldChildren[index];
    const newChild = newChildren[index];

    if (oldChild.key !== newChild.key) {
      break;
    }
    if (oldChild.type === newChild.type) {
      matched[index] = oldChild;
      lastPlacedIndex = index;
    } else {
      // key 相同但 type 变了：复用不了，旧节点连同它的 DOM 一起丢掉
      removals.push(oldChild);
    }
  }

  if (index === newChildren.length) {
    // 新列表先走完，旧列表剩下的都是多余的
    for (let i = index; i < oldChildren.length; i++) {
      removals.push(oldChildren[i]);
    }
  } else {
    // 第二轮：剩余旧节点按 key（无 key 用旧下标）建索引，按新列表顺序查找
    const existing = new Map<string | number, number>();
    for (let i = index; i < oldChildren.length; i++) {
      existing.set(oldChildren[i].key ?? i, i);
    }

    for (; index < newChildren.length; index++) {
      const newChild = newChildren[index];
      const mapKey = newChild.key ?? index;
      const oldIndex = existing.get(mapKey);

      if (oldIndex === undefined) {
        continue; // 全新节点，留给后面挂载
      }
      existing.delete(mapKey);

      const oldChild = oldChildren[oldIndex];
      if (oldChild.type !== newChild.type) {
        removals.push(oldChild);
        continue;
      }
      matched[index] = oldChild;
      if (oldIndex < lastPlacedIndex) {
        // 旧下标落在水位线后面：它跑到了某个「不动的」兄弟之后，必须移动
        moved[index] = true;
      } else {
        // 留在原地，水位线抬到它的旧下标
        lastPlacedIndex = oldIndex;
      }
    }

    for (const oldIndex of existing.values()) {
      removals.push(oldChildren[oldIndex]);
    }
  }

  // 先卸载，避免待删除的节点混进插入位置的计算
  for (const oldChild of removals) {
    unmount(oldChild);
  }

  // 从右往左提交：轮到第 i 个时，它右边的兄弟都已在最终位置上，anchor 就是
  // 右邻居的第一个宿主节点。这样不需要向上找锚点，也天然支持组件 / Fragment
  // 一对多 DOM 的情况。
  const result: VNode[] = new Array(newChildren.length);
  for (let i = newChildren.length - 1; i >= 0; i--) {
    const desc = newChildren[i];
    const oldChild = matched[i];

    if (oldChild === null) {
      result[i] = mount(desc, parentDom, anchor);
    } else {
      result[i] = patch(oldChild, desc, parentDom, anchor);
      if (moved[i]) {
        insert(result[i], parentDom, anchor);
      }
    }
    anchor = firstDom(result[i]) ?? anchor;
  }
  return result;
}

/** 由描述符生成实例；previous 非空时带走 dom / children / hooks */
function instantiate(desc: VNode, previous: VNode | null): VNode {
  return {
    type: desc.type,
    key: desc.key,
    props: desc.props,
    dom: previous === null ? null : previous.dom,
    children: previous === null ? null : previous.children,
    hooks:
      previous !== null
        ? previous.hooks
        : typeof desc.type === "function"
          ? []
          : null,
  };
}

/** 挂载一棵新子树，把产生的宿主节点插到 anchor 之前 */
export function mount(
  desc: VNode,
  parentDom: Node,
  anchor: Node | null,
): VNode {
  const vnode = instantiate(desc, null);

  if (vnode.type === Text) {
    vnode.dom = createDom(vnode);
    parentDom.insertBefore(vnode.dom, anchor);
    return vnode;
  }
  if (typeof vnode.type === "string") {
    const dom = createDom(vnode);
    vnode.dom = dom;
    // 子节点先塞进还没上树的父节点，整棵子树只触发一次真实挂载
    vnode.children = toChildArray(vnode.props.children).map((child) =>
      mount(child, dom, null),
    );
    parentDom.insertBefore(dom, anchor);
    return vnode;
  }
  // 函数组件 / Fragment 自己不产生 DOM，孩子直接挂到同一个宿主父节点上
  const rendered =
    typeof vnode.type === "function"
      ? renderComponent(vnode)
      : toChildArray(vnode.props.children);
  vnode.children = rendered.map((child) => mount(child, parentDom, anchor));
  return vnode;
}

/** 复用旧实例；调用方已保证 type 与 key 相同 */
function patch(
  oldVNode: VNode,
  desc: VNode,
  parentDom: Node,
  anchor: Node | null,
): VNode {
  const vnode = instantiate(desc, oldVNode);

  if (vnode.type === Text) {
    if (oldVNode.props.nodeValue !== vnode.props.nodeValue) {
      (vnode.dom as CharacterData).nodeValue = vnode.props.nodeValue;
    }
    return vnode;
  }
  if (typeof vnode.type === "string") {
    const dom = vnode.dom as Element;
    updateProps(dom, oldVNode.props, vnode.props);
    // 子节点住在自己的 dom 里，右边没有别的东西，锚点是 null
    vnode.children = diffChildren(
      dom,
      oldVNode.children ?? [],
      toChildArray(vnode.props.children),
      null,
    );
    return vnode;
  }
  const rendered =
    typeof vnode.type === "function"
      ? renderComponent(vnode)
      : toChildArray(vnode.props.children);
  vnode.children = diffChildren(
    parentDom,
    oldVNode.children ?? [],
    rendered,
    anchor,
  );
  return vnode;
}

/** 卸载：先跑完子树里所有 effect cleanup，再摘掉最靠上的宿主节点 */
export function unmount(vnode: VNode): void {
  teardownEffects(vnode);
  removeDoms(vnode);
}

function removeDoms(vnode: VNode): void {
  if (vnode.dom !== null) {
    vnode.dom.parentNode?.removeChild(vnode.dom);
    return;
  }
  for (const child of vnode.children ?? []) {
    removeDoms(child);
  }
}

/**
 * 移动一棵已挂载的子树：insertBefore 会把已在文档里的节点搬到新位置，
 * 所以「移动」和「插入」是同一个操作。
 */
function insert(vnode: VNode, parentDom: Node, anchor: Node | null): void {
  if (vnode.dom !== null) {
    parentDom.insertBefore(vnode.dom, anchor);
    return;
  }
  for (const child of vnode.children ?? []) {
    insert(child, parentDom, anchor);
  }
}

/** 子树里第一个宿主节点，用作左邻居的插入锚点 */
function firstDom(vnode: VNode): Node | null {
  if (vnode.dom !== null) {
    return vnode.dom;
  }
  for (const child of vnode.children ?? []) {
    const dom = firstDom(child);
    if (dom !== null) {
      return dom;
    }
  }
  return null;
}
