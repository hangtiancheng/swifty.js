import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let binding;
try {
  binding = require("./build/Release/heap.node");
} catch (cause) {
  throw new Error("@swifty.js/libheap: Native addon not found.", { cause });
}

export const { heapify, heappop, heappush, heappushpop, heapreplace, Heap } =
  binding;
