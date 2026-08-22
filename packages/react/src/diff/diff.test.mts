import { JSDOM } from "jsdom";
import assert from "node:assert/strict";

const dom = new JSDOM(`<div id="root"></div>`);
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;

const {
  createElement: h,
  Fragment,
  render,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} = await import("./index.ts");

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const container = document.querySelector("#root") as Element;
const draw = (element: any) => render(element, container);

const list = (keys: string[]) =>
  h(
    "ul",
    { className: "list" },
    keys.map((k) => h("li", { key: k, id: `i-${k}` }, k)),
  );

// 1. 首次挂载
draw(list(["a", "b", "c"]));
const ul = container.firstChild as HTMLElement;
assert.equal(ul.tagName, "UL");
assert.equal(ul.getAttribute("class"), "list");
assert.equal(ul.textContent, "abc");

const nodes: Record<string, Element> = {};
for (const li of ul.children) nodes[li.id] = li;

// 统计 ul 上真实发生的插入/移动次数
let ops = 0;
const proto = dom.window.Element.prototype;
const rawInsert = proto.insertBefore;
proto.insertBefore = function (this: Element, ...args: any[]) {
  if (this === ul) ops++;
  return (rawInsert as any).apply(this, args);
} as any;

// 2. a b c -> a c b：只该动 1 次，且全部复用原有 DOM
ops = 0;
draw(list(["a", "c", "b"]));
assert.equal(ul.textContent, "acb");
assert.equal(ops, 1, `expected 1 move, got ${ops}`);
assert.equal(ul.children[0], nodes["i-a"]);
assert.equal(ul.children[1], nodes["i-c"]);
assert.equal(ul.children[2], nodes["i-b"]);
assert.equal(container.firstChild, ul);

// 3. 尾部追加只插入 1 次，不动已有节点
draw(list(["a", "c", "b"]));
ops = 0;
draw(list(["a", "c", "b", "d"]));
assert.equal(ul.textContent, "acbd");
assert.equal(ops, 1, `expected 1 insert, got ${ops}`);

// 4. 把尾部搬到头部：React 语义下是 3 次移动（不做最长递增子序列优化）
draw(list(["a", "b", "c", "d"]));
ops = 0;
draw(list(["d", "a", "b", "c"]));
assert.equal(ul.textContent, "dabc");
assert.equal(ops, 3, `expected 3 moves, got ${ops}`);

// 5. 删除 + 插入 + 复用混合
draw(list(["d", "x", "c"]));
assert.equal(ul.textContent, "dxc");
assert.equal(ul.children.length, 3);
assert.equal(ul.children[2], nodes["i-c"]);

// 6. 无 key 时按下标复用；type 变了就重建
draw(h("div", null, h("span", null, "one"), h("span", null, "two")));
const wrapper = container.firstChild as HTMLElement;
const firstSpan = wrapper.children[0];
draw(h("div", null, h("span", null, "ONE"), h("b", null, "two")));
assert.equal(wrapper.children[0], firstSpan, "span 应被复用");
assert.equal(wrapper.children[1].tagName, "B");
assert.equal(wrapper.textContent, "ONEtwo");
assert.equal(wrapper.children.length, 2);

// 7. key 命中但 type 变了：旧 DOM 丢弃，邻居仍复用
const typed = (tag: string) =>
  h(
    "div",
    { id: "typed" },
    h("span", { key: "keep" }, "keep"),
    h(tag, { key: "swap" }, "swap"),
  );
draw(typed("span"));
const typedDom = container.firstChild as HTMLElement;
const keepDom = typedDom.children[0];
const swapDom = typedDom.children[1];
draw(typed("b"));
assert.equal(typedDom.children[0], keepDom);
assert.notEqual(typedDom.children[1], swapDom);
assert.equal(typedDom.children[1].tagName, "B");
assert.equal(typedDom.children.length, 2);
assert.equal(typedDom.textContent, "keepswap");

// 8. 文本节点原地更新
draw(h("p", null, "hello ", "world"));
const p = container.firstChild as HTMLElement;
const textNode = p.firstChild as Text;
draw(h("p", null, "bye ", "world"));
assert.equal(p.firstChild, textNode);
assert.equal(textNode.nodeValue, "bye ");
assert.equal(p.textContent, "bye world");

// 9. props：属性删除、事件替换、style 对象
let clicks = 0;
draw(
  h("button", {
    id: "btn",
    title: "t",
    style: { color: "red", width: "10px" },
    onClick: () => clicks++,
  }),
);
const btn = container.firstChild as HTMLButtonElement;
btn.click();
draw(
  h("button", { id: "btn", style: { color: "blue" }, onClick: () => clicks++ }),
);
btn.click();
assert.equal(clicks, 2);
assert.equal(btn.hasAttribute("title"), false);
assert.equal(btn.style.color, "blue");
assert.equal(btn.style.width, "");

// 10. 函数组件 + Fragment：一个 VNode 对应多个 DOM，移动时锚点要跨层级算
function Pair({ label }: { label: string }) {
  return h(Fragment, null, h("s", null, label), h("u", null, label));
}
const pairs = (keys: string[]) =>
  h(
    "div",
    { id: "pairs" },
    keys.map((k) => h(Pair, { key: k, label: k })),
    h("hr", null),
  );

draw(pairs(["1", "2", "3"]));
const pairsDom = container.firstChild as HTMLElement;
assert.equal(pairsDom.textContent, "112233");
assert.equal((pairsDom.lastChild as Element).tagName, "HR");
const firstS = pairsDom.children[0];

draw(pairs(["3", "1", "2"]));
assert.equal(pairsDom.textContent, "331122");
assert.equal(pairsDom.children[2], firstS, "被移动的组件应复用原有 DOM");
assert.equal((pairsDom.lastChild as Element).tagName, "HR", "hr 应始终在末尾");
assert.equal(pairsDom.children.length, 7);

draw(pairs(["2"]));
assert.equal(pairsDom.textContent, "22");
assert.equal(pairsDom.children.length, 3);

// 11. 条件渲染：false / null 直接跳过
const toggle = (on: boolean) =>
  h("div", null, "a", on && h("em", null, "b"), "c");
draw(toggle(true));
const toggleDom = container.firstChild as HTMLElement;
assert.equal(toggleDom.textContent, "abc");
draw(toggle(false));
assert.equal(toggleDom.textContent, "ac");
draw(toggle(true));
assert.equal(toggleDom.textContent, "abc");

// 12. useState：事件里多次 setState 合并成一次重渲，函数式更新都生效
let counterRenders = 0;
function Counter() {
  counterRenders++;
  const [n, setN] = useState(0);
  const [m, setM] = useState(10);
  return h(
    "div",
    null,
    h(
      "button",
      {
        id: "go",
        onClick: () => {
          setN((v: number) => v + 1);
          setN((v: number) => v + 1);
          setM(20);
        },
      },
      "go",
    ),
    h("i", null, `${n}:${m}`),
  );
}
draw(h(Counter, null));
assert.equal(counterRenders, 1);
assert.equal(container.querySelector("i")!.textContent, "0:10");
(container.querySelector("#go") as HTMLElement).click();
await tick();
assert.equal(counterRenders, 2, "batched: exactly one re-render");
assert.equal(container.querySelector("i")!.textContent, "2:20");

// 13. setState 相同值：eager bailout，不触发重渲
let bailRenders = 0;
function Bail() {
  bailRenders++;
  const [v, setV] = useState(5);
  return h("button", { id: "bail", onClick: () => setV(5) }, String(v));
}
draw(h(Bail, null));
(container.querySelector("#bail") as HTMLElement).click();
await tick();
assert.equal(bailRenders, 1, "same-value setState should not re-render");

// 14. useEffect：子先父后、deps 变化才重跑、卸载时 cleanup
const effects: string[] = [];
function Child({ label }: { label: string }) {
  useEffect(() => {
    effects.push(`mount:${label}`);
    return () => effects.push(`unmount:${label}`);
  }, []);
  return h("span", null, label);
}
function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    effects.push(`count:${count}`);
  }, [count]);
  return h(
    "div",
    { id: "app" },
    h(
      "button",
      {
        id: "inc",
        onClick: () => {
          setCount((c: number) => c + 1);
          setCount((c: number) => c + 1);
        },
      },
      "+",
    ),
    h(
      Fragment,
      null,
      h(Child, { label: "L1" }),
      count > 0 && h(Child, { label: "L2" }),
    ),
    h("i", null, String(count)),
  );
}
draw(h(App, null));
const app = container.firstChild as HTMLElement;
assert.equal(app.textContent, "+L10");
assert.deepEqual(effects, ["mount:L1", "count:0"]);

const staticSpan = app.querySelector("span");
(container.querySelector("#inc") as HTMLElement).click();
await tick();
assert.equal(app.textContent, "+L1L22");
assert.equal(
  app.querySelector("span"),
  staticSpan,
  "已挂载子组件的 DOM 应复用",
);
assert.deepEqual(effects, ["mount:L1", "count:0", "mount:L2", "count:2"]);

draw(h("div", null, "reset"));
assert.deepEqual(effects.slice(-2), ["unmount:L1", "unmount:L2"]);
assert.equal(container.textContent, "reset");

// 15. 带 key 的有状态组件被移动：state 与 DOM 都保留
function Item({ id }: { id: string }) {
  const [n, setN] = useState(0);
  return h(
    "button",
    { id: `it-${id}`, onClick: () => setN((v: number) => v + 1) },
    `${id}=${n}`,
  );
}
const board = (keys: string[]) =>
  h(
    "div",
    null,
    keys.map((k) => h(Item, { key: k, id: k })),
  );

draw(board(["x", "y"]));
(container.querySelector("#it-x") as HTMLElement).click();
await tick();
(container.querySelector("#it-x") as HTMLElement).click();
await tick();
const btnX = container.querySelector("#it-x");
assert.equal(btnX!.textContent, "x=2");

draw(board(["y", "x"]));
const boardDom = container.firstChild as HTMLElement;
assert.equal(boardDom.children[0].id, "it-y");
assert.equal(boardDom.children[1], btnX, "移动后 DOM 身份不变");
assert.equal(boardDom.children[1].textContent, "x=2", "移动后 state 保留");

// 16. useMemo / useCallback / useRef 的缓存与身份稳定性
let memoCalls = 0;
const seen: { value: number; ref: object; cb: () => number }[] = [];
function Memoized({ dep }: { dep: number; tick: number }) {
  const value = useMemo(() => {
    memoCalls++;
    return dep * 2;
  }, [dep]);
  const ref = useRef<{ n?: number }>({});
  const cb = useCallback(() => dep, [dep]);
  seen.push({ value, ref, cb });
  return h("span", null, String(value));
}
draw(h(Memoized, { dep: 1, tick: 1 }));
draw(h(Memoized, { dep: 1, tick: 2 }));
draw(h(Memoized, { dep: 2, tick: 3 }));
assert.equal(memoCalls, 2, "dep 不变时 useMemo 不重算");
assert.deepEqual(
  seen.map((s) => s.value),
  [2, 2, 4],
);
assert.equal(seen[0].ref, seen[1].ref, "useRef 跨渲染身份稳定");
assert.equal(seen[1].ref, seen[2].ref);
assert.equal(seen[0].cb, seen[1].cb, "deps 不变时 useCallback 身份稳定");
assert.notEqual(seen[1].cb, seen[2].cb, "deps 变化时 useCallback 更新");

// 17. 卸载
draw(null);
assert.equal(container.childNodes.length, 0);

console.log("all react-lite assertions passed");
