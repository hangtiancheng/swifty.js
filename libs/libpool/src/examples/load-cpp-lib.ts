/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ffi from "ffi-napi";
import ref from "ref-napi";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const filename__ = fileURLToPath(import.meta.url);
const dirname__ = dirname(filename__);

console.log({
  filename__,
  dirname__,
  url: import.meta.url,
  filename: import.meta.filename,
  dirname: import.meta.dirname,
});

const voidPtr = ref.refType(ref.types.void);
const double = ref.types.double;
const int = ref.types.int;

export default function loadCppLib() {
  const isMac = process.platform === "darwin";
  const ext = isMac ? "dylib" : "so";
  const cppLibPath = resolve(
    dirname__,
    `../../../libheap/build/libheap.${ext}`,
  );
  const cppLib = ffi.Library(cppLibPath, {
    // void* create(int is_min_heap)
    create: [voidPtr, [int]],

    // void destroy(void* handle)
    destroy: ["void", [voidPtr]],

    // void heapify(void* handle, double* arr, int size)
    heapify: ["void", [voidPtr, ref.refType(double), int]],

    // double heappop(void* handle)
    heappop: [double, [voidPtr]],

    // void heappush(void* handle, double item)
    heappush: ["void", [voidPtr, double]],

    // double heappushpop(void* handle, double item)
    heappushpop: [double, [voidPtr, double]],

    // double heapreplace(void* handle, double item)
    heapreplace: [double, [voidPtr, double]],

    // int heapsize(void* handle)
    heapsize: [int, [voidPtr]],

    // double heeppeek(void* handle)
    heappeek: [double, [voidPtr]],
  });
  return cppLib;
}
