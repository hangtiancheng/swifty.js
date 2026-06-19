/**
 * VDOM Engine for Lark-MVC.
 *
 * Provides virtual DOM node creation, diffing, and DOM conversion.
 * Three-phase diff algorithm: head fast-path, tail fast-path, keyMap reconciliation.
 *
 * When `FrameworkConfig.virtualDom` is true, the Updater uses this engine
 * instead of the string-based DOM diff in dom.ts.
 *
 * Core functions:
 * - vdomCreate: create VDomNode trees (template calls this)
 * - vdomSetChildNodes: diff between old and new VDOM trees
 * - vdomCreateNode: convert a VDomNode to a real DOM node
 * - vdomSetAttributes: diff attributes between VDomNodes
 * - createVDomRef: create a diff operation tracker
 */
import {
  SPLITTER,
  V_TEXT_NODE,
  TAG_STATIC_KEY,
  VDOM_NS_MAP,
  LARK_VIEW,
  encodeHTML,
} from "./common";
import { parseUri, hasOwnProperty, callFunction } from "./utils";
import { domUnmountFrames } from "./dom";
import type { VDomNode, VDomRef, FrameInterface, ViewInterface } from "./types";

// ============================================================
// Constants
// ============================================================

/** Special element properties synced as DOM properties (not attributes) */
const DOM_SPECIALS: Record<string, string[]> = {
  INPUT: ["value", "checked"],
  TEXTAREA: ["value"],
  OPTION: ["selected"],
};

// ============================================================
// vdomCreate — VNode creation
// ============================================================

/**
 * Create a virtual DOM node.
 *
 * Text node: `vdomCreate(0, 'text content')`
 * Element: `vdomCreate('div', { class: 'row' }, [child1, child2])`
 * Self-closing: `vdomCreate('br', null, 1)`
 * Raw HTML: `vdomCreate(0, '<b>bold</b>', 1)` (children truthy → raw HTML node)
 * Root: `vdomCreate(viewId, 0, [children])`
 */
export function vdomCreate(
  tag: string | number,
  props?: Record<string, unknown> | string | number | null,
  children?: VDomNode[] | string | number | null,
  specials?: Record<string, string>,
): VDomNode {
  // ── Text / raw-HTML node ──
  if (!tag) {
    return {
      tag: children ? SPLITTER : V_TEXT_NODE,
      html: String(props ?? ""),
    };
  }

  // ── Element node ──
  const propsObj = (props || {}) as Record<string, unknown>;
  const specialsObj = specials || {};
  const unary = children === 1;

  let compareKey: string | undefined;
  let innerHTML = "";
  let newChildren: VDomNode[] | undefined;
  let reused: Record<string, number> | undefined;
  let reusedTotal = 0;
  let viewList: VDomNode["views"];
  let isLarkView: string | undefined;
  let attrs = `<${tag}`;
  let hasSpecials: Record<string, string> | undefined;
  let prevChild: VDomNode | undefined;

  // 1. Process children array
  if (children && children !== 1) {
    for (const c of children as VDomNode[]) {
      if (c.attrs !== undefined) {
        // Element child: serialize as opening tag + innerHTML + closing tag
        innerHTML += c.attrs + (c.selfClose ? "/>" : `>${c.html}</${c.tag}>`);
      } else {
        // Text or raw-HTML child
        if (c.tag === V_TEXT_NODE) {
          innerHTML += encodeHTML(c.html);
        } else {
          innerHTML += c.html;
        }
      }

      // Merge adjacent text nodes
      if (c.tag === V_TEXT_NODE && prevChild && prevChild.tag === V_TEXT_NODE) {
        prevChild.html += c.html;
      } else {
        if (!newChildren) newChildren = [];
        newChildren.push(c);
        prevChild = c;
      }

      // Collect reused keys
      if (c.compareKey) {
        if (!reused) reused = {};
        reused[c.compareKey] = (reused[c.compareKey] || 0) + 1;
        reusedTotal++;
      }

      // Propagate sub-view references
      if (c.views) {
        if (!viewList) viewList = [];
        viewList.push(...c.views);
      }
    }
  }

  // 2. Process props
  hasSpecials = specials || undefined;

  for (const prop in propsObj) {
    let value = propsObj[prop];

    // Boolean / null handling
    if (value === false || value == null) {
      if (!specialsObj[prop]) {
        delete propsObj[prop];
      }
      continue;
    } else if (value === true) {
      propsObj[prop] = value = specialsObj[prop] ? value : "";
    }

    // Compare key candidates: _, id, #
    if (
      (prop === "#" || prop === "id" || prop === TAG_STATIC_KEY) &&
      !compareKey
    ) {
      compareKey = value as string;
      if (prop !== "id") {
        delete propsObj[prop];
        continue;
      }
    }

    // v-lark sub-view detection
    if (prop === LARK_VIEW && value) {
      const parsed = parseUri(value as string);
      isLarkView = parsed.path;
      if (!viewList) viewList = [];
      viewList.push([
        isLarkView,
        propsObj["lark-owner"] as string,
        value as string,
        parsed.params,
      ]);
      if (!compareKey) {
        compareKey = tag + SPLITTER + isLarkView;
      }
    }

    // View params key
    // textarea value: write as innerHTML, not as attribute
    if (prop === "value" && tag === "textarea") {
      innerHTML = String(value);
      delete propsObj[prop];
      continue;
    }

    // Serialize attribute
    attrs += ` ${prop}="${value && encodeHTML(value)}"`;
  }

  return {
    tag,
    html: innerHTML,
    attrs,
    attrsMap: propsObj,
    attrsSpecials: specialsObj,
    hasSpecials,
    children: newChildren,
    compareKey,
    reused,
    reusedTotal,
    views: viewList,
    selfClose: unary,
    isLarkView,
  };
}

// ============================================================
// isSameVDomNode — Node matching predicate
// ============================================================

/**
 * Determine whether two VDomNodes represent the same logical node.
 *
 * Two nodes are "same" if:
 * 1. Both have compareKey and keys match, OR
 * 2. Neither has compareKey and tags match, OR
 * 3. Either node is a SPLITTER (raw HTML) node
 */
function isSameVDomNode(a: VDomNode, b: VDomNode): boolean {
  return (
    (a.compareKey && b.compareKey === a.compareKey) ||
    (!a.compareKey && !b.compareKey && a.tag === b.tag) ||
    a.tag === SPLITTER ||
    b.tag === SPLITTER
  );
}

// ============================================================
// vdomCreateNode — Convert VDomNode to real DOM
// ============================================================

/**
 * Create a real DOM node from a VDomNode.
 *
 * Text node → `document.createTextNode(html)`
 * Element → `createElementNS` + `vdomSetAttributes` + `innerHTML`
 */
export function vdomCreateNode(
  vnode: VDomNode,
  owner: Element,
  ref: VDomRef,
): ChildNode {
  const tag = vnode.tag;
  if (tag === V_TEXT_NODE) {
    return document.createTextNode(vnode.html);
  }

  const sTag = typeof tag === "string" ? tag : tag.toString();
  const ns = VDOM_NS_MAP[sTag] || owner.namespaceURI;
  const el = document.createElementNS(ns, sTag);
  vdomSetAttributes(el, vnode, ref);
  el.innerHTML = vnode.html;
  return el;
}

// ============================================================
// vdomSetAttributes — Attribute diff
// ============================================================

/**
 * Set/update attributes on a real DOM element from a VDomNode.
 *
 * If `lastVDom` is provided, removes old attributes not present in new.
 * Special attributes are set as DOM properties; others via setAttribute.
 *
 * Returns 1 if any attribute changed, 0 otherwise.
 */
export function vdomSetAttributes(
  realNode: Element,
  newVDom: VDomNode,
  ref: VDomRef,
  lastVDom?: VDomNode,
): number {
  let changed = 0;
  const nMap = newVDom.attrsMap || {};
  const nsMap = newVDom.attrsSpecials || {};

  if (lastVDom) {
    const oMap = lastVDom.attrsMap || {};
    const osMap = lastVDom.attrsSpecials || {};

    // Remove old attributes not in new
    for (const key in oMap) {
      if (!hasOwnProperty(nMap, key)) {
        changed = 1;
        const sValue = osMap[key];
        if (sValue) {
          if (ref) {
            ref.nodeProps.push([realNode, sValue, ""]);
          } else {
            Reflect.set(realNode, sValue, "");
          }
        } else {
          realNode.removeAttribute(key);
        }
      }
    }
  }

  // Add/update new attributes
  for (const key in nMap) {
    const value = nMap[key];
    const sKey = nsMap[key];

    if (sKey) {
      // Special: set as DOM property — compare against DOM real-time value
      // to detect user-interaction changes (e.g., typing in input)
      if (Reflect.get(realNode, sKey) !== value) {
        changed = 1;
        if (ref) {
          ref.nodeProps.push([realNode, sKey, value]);
        } else {
          Reflect.set(realNode, sKey, value);
        }
      }
    } else {
      // Normal: set as attribute
      const oldMap = lastVDom?.attrsMap;
      if (!oldMap || oldMap[key] !== value) {
        changed = 1;
        realNode.setAttribute(key, String(value ?? ""));
      }
    }
  }

  return changed;
}

// ============================================================
// vdomSyncFormState — Form element state sync
// ============================================================

/**
 * Sync form element state properties (value, checked, selected)
 * directly from the VDomNode's attrsMap to the real DOM element.
 *
 * These properties carry DOM state not reflected in HTML attributes
 * (e.g., user-typed input value vs. the `value` attribute).
 *
 * Replaces the old vdomSpecialDiff approach which created a throwaway
 * DOM element via vdomCreateNode — that called setAttribute for ALL
 * attributes (including @event names) on the throwaway, causing
 * InvalidCharacterError in browsers with strict XML Name validation.
 */
function vdomSyncFormState(realNode: ChildNode, newVDom: VDomNode): number {
  const specials = DOM_SPECIALS[realNode.nodeName];
  if (!specials) return 0;

  const nMap = newVDom.attrsMap || {};
  let result = 0;

  for (const prop of specials) {
    const newVal = nMap[prop];
    if (newVal !== undefined && Reflect.get(realNode, prop) !== newVal) {
      result = 1;
      Reflect.set(realNode, prop, newVal);
    }
  }
  return result;
}

// ============================================================
// vdomSetNode — Per-node update
// ============================================================

/**
 * Diff and update a single DOM node against a new VDomNode.
 *
 * Handles text updates, attribute diffing, static key short-circuit,
 * sub-view preservation, recursive child diff, and tag mismatch replacement.
 */
function vdomSetNode(
  realNode: ChildNode,
  oldParent: Element,
  lastVDom: VDomNode,
  newVDom: VDomNode,
  ref: VDomRef,
  frame: FrameInterface,
  keys: ReadonlySet<string>,
  rootView: ViewInterface,
  ready: () => void,
): void {
  // Text/raw-HTML nodes: if tags differ between text and raw, just replace
  const lastTag = lastVDom.tag;
  const newTag = newVDom.tag;

  if (lastTag === V_TEXT_NODE || newTag === V_TEXT_NODE) {
    // Text node update
    if (lastTag === newTag) {
      if (lastVDom.html !== newVDom.html) {
        ref.changed = 1;
        realNode.nodeValue = newVDom.html;
      }
    } else {
      // Tag mismatch: replace
      ref.changed = 1;
      domUnmountFrames(frame, realNode);
      oldParent.replaceChild(vdomCreateNode(newVDom, oldParent, ref), realNode);
    }
    return;
  }

  // Element nodes
  if (lastTag === newTag) {
    const lastAMap = lastVDom.attrsMap || {};
    const newAMap = newVDom.attrsMap || {};

    // Static key short-circuit: if both have matching compareKey from _ (not id),
    // skip the entire subtree. The _ attribute is extracted as compareKey and
    // deleted from attrsMap during vdomCreate, so we check compareKey directly.
    if (
      lastVDom.compareKey &&
      lastVDom.compareKey === newVDom.compareKey &&
      !lastAMap["id"] &&
      !newAMap["id"]
    ) {
      return;
    }

    // Attribute diff
    let attrChanged = 0;
    if (lastVDom.attrs !== newVDom.attrs || newVDom.hasSpecials) {
      attrChanged = vdomSetAttributes(
        realNode as Element,
        newVDom,
        ref,
        lastVDom,
      );
      if (attrChanged) ref.changed = 1;
    }

    // Sub-view handling
    let updateChildren = true;
    if (newVDom.isLarkView) {
      const oldFrameId = (realNode as Element).getAttribute("id") || "";
      const newViewPath = newVDom.isLarkView;
      const oldViewPath = lastVDom.isLarkView || "";

      if (oldFrameId && newViewPath === oldViewPath) {
        // Same view: preserve existing sub-view
        updateChildren = false;
      }
    }

    // Form element special diff: sync value/checked/selected directly
    // from VDomNode.attrsMap to avoid creating a throwaway DOM element
    // (which would call setAttribute for @event attributes and throw).
    vdomSyncFormState(realNode, newVDom);

    // Recursive child diff
    if (updateChildren && !newVDom.selfClose) {
      vdomSetChildNodes(
        realNode as Element,
        lastVDom,
        newVDom,
        ref,
        frame,
        keys,
        rootView,
        ready,
      );
    }
  } else {
    // Tag mismatch: replace entire node
    ref.changed = 1;
    domUnmountFrames(frame, realNode);
    oldParent.replaceChild(vdomCreateNode(newVDom, oldParent, ref), realNode);
  }
}

// ============================================================
// vdomSetChildNodes — Three-phase diff
// ============================================================

/**
 * Diff children of a real DOM parent against old and new VDOM trees.
 *
 * Three-phase algorithm:
 * 1. Head fast-path: match identical nodes from the start
 * 2. Tail fast-path: match identical nodes from the end
 * 3. KeyMap reconciliation: build key→node index, process remaining children
 *
 * Old DOM node references are snapshotted before any mutations to ensure
 * correct removal regardless of DOM position shifts.
 *
 * Fast path: on first render (lastVDom undefined), sets innerHTML directly.
 */
export function vdomSetChildNodes(
  realNode: Element,
  lastVDom: VDomNode | undefined,
  newVDom: VDomNode,
  ref: VDomRef,
  frame: FrameInterface,
  keys: ReadonlySet<string>,
  view: ViewInterface,
  ready: () => void,
): void {
  // Fast path: first render
  if (!lastVDom) {
    ref.changed = 1;
    realNode.innerHTML = newVDom.html;
    return;
  }

  // Short-circuit when HTML is identical.
  // Avoids the full diff loop for no-op re-renders (data set but unchanged).
  if (lastVDom.html === newVDom.html) {
    return;
  }

  const oldChildren = lastVDom.children;
  const newChildren = newVDom.children;
  const oldLen = oldChildren?.length || 0;
  const newLen = newChildren?.length || 0;

  // Both empty: nothing to do
  if (oldLen === 0 && newLen === 0) return;

  const nodes = realNode.childNodes;

  // ── Snapshot all old DOM node references BEFORE any mutations. ──
  // This ensures we always know which DOM nodes belong to the old children,
  // regardless of how insertBefore/removeChild reshuffles the NodeList.
  const oldDomNodes: ChildNode[] = new Array(oldLen);
  for (let i = 0; i < oldLen; i++) {
    oldDomNodes[i] = nodes[i] as ChildNode;
  }

  // Track which old DOM nodes are reused (to remove unused ones later)
  const usedOldDomNodes = new Set<ChildNode>();

  let headIdx = 0;
  let tailIdx = oldLen - 1;
  let newHead = 0;
  let newTail = newLen - 1;

  // ── Phase 1: Head fast-path ──
  // Match identical nodes from the start. No DOM moves — only in-place updates.
  while (headIdx <= tailIdx && newHead <= newTail) {
    const oc = oldChildren![headIdx];
    const nc = newChildren![newHead];
    if (!isSameVDomNode(nc, oc)) break;
    if (nc.tag === SPLITTER || oc.tag === SPLITTER) break;

    vdomSetNode(
      oldDomNodes[headIdx],
      realNode,
      oc,
      nc,
      ref,
      frame,
      keys,
      view,
      ready,
    );
    usedOldDomNodes.add(oldDomNodes[headIdx]);
    headIdx++;
    newHead++;
  }

  // ── Phase 2: Tail fast-path ──
  // Match identical nodes from the end. No DOM moves — only in-place updates.
  while (headIdx <= tailIdx && newHead <= newTail) {
    const oc = oldChildren![tailIdx];
    const nc = newChildren![newTail];
    if (!isSameVDomNode(nc, oc)) break;
    if (nc.tag === SPLITTER || oc.tag === SPLITTER) break;

    vdomSetNode(
      oldDomNodes[tailIdx],
      realNode,
      oc,
      nc,
      ref,
      frame,
      keys,
      view,
      ready,
    );
    usedOldDomNodes.add(oldDomNodes[tailIdx]);
    tailIdx--;
    newTail--;
  }

  // All matched? Early exit
  if (headIdx > tailIdx && newHead > newTail) {
    if (ref.asyncCount === 0) callFunction(ready, []);
    return;
  }

  // ── Build keyMap from remaining old children ──
  // Maps compareKey → { domNode, vdomNode } for keyed lookup.
  const keyMap: Record<
    string,
    Array<{ domNode: ChildNode; vdomNode: VDomNode }>
  > = {};
  for (let i = headIdx; i <= tailIdx; i++) {
    const c = oldChildren![i];
    if (c?.compareKey) {
      if (!keyMap[c.compareKey]) keyMap[c.compareKey] = [];
      keyMap[c.compareKey].push({ domNode: oldDomNodes[i], vdomNode: c });
    }
  }

  // Insertion point: where the next node should be placed.
  // After Phase 1, oldDomNodes[headIdx] is the first unmatched old DOM node.
  let insertRef: ChildNode | null =
    headIdx <= tailIdx ? oldDomNodes[headIdx] : null;

  // ── Phase 3: Process remaining children via keyMap ──
  for (let i = newHead; i <= newTail; i++) {
    const nc = newChildren![i];
    const cKey = nc.compareKey;

    if (cKey && keyMap[cKey]?.length) {
      // Keyed: reuse old DOM node, move to correct position
      const entry = keyMap[cKey].shift()!;
      if (keyMap[cKey].length === 0) delete keyMap[cKey];

      usedOldDomNodes.add(entry.domNode);

      if (entry.domNode !== insertRef) {
        ref.changed = 1;
        realNode.insertBefore(entry.domNode, insertRef);
      }

      vdomSetNode(
        entry.domNode,
        realNode,
        entry.vdomNode,
        nc,
        ref,
        frame,
        keys,
        view,
        ready,
      );

      // Advance insertRef past the just-placed node
      insertRef = entry.domNode.nextSibling as ChildNode | null;
    } else if (!cKey) {
      // Non-keyed: try in-place update or create new
      if (
        insertRef &&
        (insertRef as Element).nodeType === 1 &&
        (insertRef as Element).tagName ===
          (typeof nc.tag === "string" ? nc.tag.toUpperCase() : "")
      ) {
        // Same tag: update in place
        vdomSetNode(
          insertRef,
          realNode,
          oldChildren![headIdx] || nc,
          nc,
          ref,
          frame,
          keys,
          view,
          ready,
        );
        usedOldDomNodes.add(insertRef);
        insertRef = insertRef.nextSibling as ChildNode | null;
      } else {
        // Tag mismatch or no old node: create new
        ref.changed = 1;
        const newNode = vdomCreateNode(nc, realNode, ref);
        realNode.insertBefore(newNode, insertRef);
      }
    } else {
      // New keyed node not in old children: create new
      ref.changed = 1;
      const newNode = vdomCreateNode(nc, realNode, ref);
      realNode.insertBefore(newNode, insertRef);
    }
  }

  // ── Remove unused old DOM nodes ──
  // Uses the snapshot references, not live NodeList positions.
  for (let i = 0; i < oldLen; i++) {
    const domNode = oldDomNodes[i];
    if (
      domNode &&
      !usedOldDomNodes.has(domNode) &&
      domNode.parentNode === realNode
    ) {
      domUnmountFrames(frame, domNode);
      ref.changed = 1;
      realNode.removeChild(domNode);
    }
  }

  // P2 #7: Defer the ready callback to the scheduler queue.
  // DOM operations above are synchronous (fast), but the ready callback
  // (which triggers endUpdate, nodeProps, and sub-view re-renders) is
  // deferred so the browser can process events and paint between the
  // DOM mutations and post-processing. This prevents long tasks from
  // blocking user interaction during large updates.
  if (ref.asyncCount === 0) {
    callFunction(ready, []);
  }
}

// ============================================================
// createVDomRef — Create diff operation tracker
// ============================================================

/**
 * Create an empty VDomRef for tracking diff operations.
 */
export function createVDomRef(viewId: string): VDomRef {
  return {
    viewId,
    viewRenders: [],
    nodeProps: [],
    asyncCount: 0,
    changed: 0,
    domOps: [],
  };
}
