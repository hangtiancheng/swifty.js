# Code Review 报告

## 基本信息

- **Review 范围**：`@swifty.js/libheap` Node.js C++ addon 项目整体（按用户要求重点审查 CMake 正确性、JS 类型支持完备性、`src/` 核心算法正确性）
- **涉及文件**：
  - `CMakeLists.txt` / `binding.gyp`（构建配置）
  - `index.js` / `index.d.ts`（JS 入口与类型声明）
  - `src/heap.h`（核心堆算法模板）
  - `src/addon.cc`（N-API 绑定层）
  - `tests/test.js` / `tests/bench.js`（测试与基准）
  - `package.json` / `vitest.config.js`
- **测试现状**：`npx vitest run` 通过（18/18）
- **构建系统**：双构建系统（node-gyp 主用，CMake 注释写「仅 IDE 支持」，但 `package.json` 暴露了 `cmake` 脚本）

## 亮点

- **算法实现正确**：`sift_down` / `sift_up` / `heapify` / `heappush` / `heappop` / `heappushpop` / `heapreplace` 均符合 Python `heapq` 语义，三路比较器契约在 `heap.h:26-28` 注释中明确说明（`heappushpop` 依赖 `cmp(...) <= 0`）。
- **NaN 主动拒绝**：`addon.cc:64-74` 的 `CheckedNumber` 在入口处拒绝 NaN，避免比较器因 NaN 失序导致堆损坏——这是 Python `heapq` 用户常踩的坑，这里主动防范。
- **双 API 设计合理**：无状态函数 API（操作 JS 数组）与有状态 `Heap` 类（数据驻留 C++）分工清晰；后者避免每次操作的 O(n) 数组拷贝，`bench.js` 也对二者做了对比。
- **比较器分发优化**：`WithCompare` / `WithOwnCompare` 在无 JS 比较器时走原生 `NativeMinCompare`，避免每次比较跨越 N-API 边界，注释也点明了这一性能考虑。
- **错误传播测试**：`test.js:86-93` 同时验证了异常传播和调用方数组未被污染，质量较高。
- **`index.d.ts` 类型声明较完整**：每个导出都有 `@param` / `@returns` / `@throws`，`CompareFunction` 类型与 `Heap` 类文档清晰。

---

## 必须修改

### 🔴 [blocking] `CMakeLists.txt:43` — `NAPI_DISABLE_CPP_EXCEPTIONS` 与代码及 `binding.gyp` 完全矛盾

`src/addon.cc` 大量使用 `throw Napi::TypeError::New(...)` / `throw Napi::Error::New(...)`，这依赖 `node-addon-api` 的 `NAPI_CPP_EXCEPTIONS` 宏启用 try-catch 包装（`NODE_API_MODULE` 宏展开后的 `__napi_##modname` 包装函数只有在 `NAPI_CPP_EXCEPTIONS` 定义时才会 `catch (const Napi::Error&)`）。

- `binding.gyp:22` 正确地定义了 `NAPI_CPP_EXCEPTIONS`，并通过 `cflags!: ["-fno-exceptions"]` 移除 `-fno-exceptions`，启用异常。
- `CMakeLists.txt:43` 却定义了语义相反的 `NAPI_DISABLE_CPP_EXCEPTIONS`，且未显式启用异常。

**后果**：一旦有人按 `package.json` 的 `cmake` 脚本（`cmake -S ./ -B ./build && cmake --build ./build`）构建，得到的 `.node` 在任何 `throw Napi::TypeError` 触发时（包括 `heapify([1, "x"])` 这种正常的参数校验）会直接 `std::terminate`，整个 Node 进程崩溃。即便不抛异常，`Napi::Error` 也不会被包装层转换成 JS 异常，错误处理链路是断的。

**修复建议**：把 `add_definitions(-DNAPI_DISABLE_CPP_EXCEPTIONS)` 改为 `NAPI_CPP_EXCEPTIONS`，并显式开启异常（更现代的写法是 `target_compile_definitions` / `target_compile_options`）：
```cmake
target_compile_definitions(addon PRIVATE NAPI_CPP_EXCEPTIONS)
target_compile_options(addon PRIVATE -fexceptions)
```

---

## 建议修复

### 🟡 [important] `CMakeLists.txt:65-68` — `PREFIX`/`SUFFIX` 组合产生的产物名是 `heapaddon.node`，与 `index.js` 期望的 `heap.node` 不一致

CMake 共享库产物文件名为 `${PREFIX}${TARGET_NAME}${SUFFIX}`。当前 target 名为 `addon`，`PREFIX "heap"`，`SUFFIX ".node"`，因此产物是 `heapaddon.node`。而 `index.js:23` 加载的是 `./build/Release/heap.node`，`binding.gyp:4` 的 target 名也是 `heap`（产物 `heap.node`）。

**后果**：CMake 构建出的 `.node` 文件名不匹配，无法被 `index.js` 直接加载；用户需要手动重命名才能使用，极易踩坑。

**修复建议**：
```cmake
set_target_properties(addon PROPERTIES
  OUTPUT_NAME "heap"
  PREFIX ""
  SUFFIX ".node"
)
```

### 🟡 [important] `CMakeLists.txt:47-51` — `GLOB_RECURSE` 会递归匹配 `node_modules/` 下的 `.h`/`.cc`

```cmake
file(GLOB_RECURSE SOURCE_FILES
  "${CMAKE_SOURCE_DIR}/*.h"
  "${CMAKE_SOURCE_DIR}/*.cc"
  "${CMAKE_SOURCE_DIR}/src/*.cc"
)
```

`GLOB_RECURSE` 会对 `${CMAKE_SOURCE_DIR}` 整棵子树递归匹配 `*.h`/`*.cc`，包括 `node_modules/`（`node-addon-api` 自带 `napi.h`、`common.h`，其它依赖可能带 `.cc`）。`cmake --build . --target format` 会把 `node_modules` 里的头文件也拿去 `clang-format -i`，污染第三方代码。

**修复建议**：限定到 `src/`，且无需 `RECURSE`（`src/` 只有一层）：
```cmake
file(GLOB SOURCE_FILES
  "${CMAKE_SOURCE_DIR}/src/*.h"
  "${CMAKE_SOURCE_DIR}/src/*.cc"
)
```

### 🟡 [important] `CMakeLists.txt:22, 25-26` — 在 `project()` 之后设置 `CMAKE_GENERATOR` / `CMAKE_C/CXX_COMPILER` 无效

CMake 在 `project()` 调用时完成编译器探测与生成器选择，之后再 `set(CMAKE_C_COMPILER clang)` 不会改变已选定的编译器，只会触发警告或被忽略。`set(CMAKE_GENERATOR Ninja)` 作为普通变量在 `project()` 之后设置也是空操作——生成器必须通过 `-G Ninja` 命令行参数或 `CMakePresets.json` 指定。

**修复建议**：把编译器选择移到 `project()` 之前并以 CACHE 变量形式；或直接删除让 CMake 用默认编译器。`CMAKE_GENERATOR` 那行直接删掉。

### 🟡 [important] `CMakeLists.txt:24` — 注释写 "MacOS, Linux" 但硬编码 `clang`/`clang++`，Linux 上未必可用

很多 Linux 环境（CI、容器、最小化镜像）默认只有 `gcc`/`g++`，没有 `clang`。强制 `clang` 会让 `cmake` 脚本在这些环境直接失败。同时 CMake 完全没处理 Windows（`node.lib` 链接、`LINK_FLAGS` 差异），注释也没说明。

**修复建议**：去掉强制赋值，或者改为「优先 clang，回退默认」的策略；并在注释中明确 Windows 不支持。

### 🟡 [important] `src/addon.cc:198-306` — `Heap` 类方法在 JS 比较器抛异常时不回滚，堆状态可能损坏

无状态函数 API（`Heapify`/`Heappush`/…）先把数组拷贝到 `std::vector`，操作完成后再 `WriteBack`；若中途 JS 比较器抛异常，`WriteBack` 不会执行，调用方数组保持原状——这正是 `test.js:86-93` 测试验证的行为。

但 `Heap` 类的方法直接操作成员 `data_`：
```cpp
Napi::Value Push(const Napi::CallbackInfo &info) {
  ...
  WithOwnCompare(env, [&](auto cmp) { libheap::heappush(data_, item, cmp); });
  ...
}
```
`libheap::heappush`（`heap.h:88-91`）会先 `push_back` 再 `sift_up`，`sift_up` 中途多次调用 `cmp`。若某次 `cmp` 抛异常，`data_` 已被 `push_back` 且部分 `sift_up` 已执行——堆不变式被破坏，且无法回滚。后续 `pop` / `peek` 等操作基于损坏的堆，结果未定义。`heapreplace` / `heappushpop` / 构造函数里的 `heapify` 同理。

**测试缺口**：`test.js:86-93` 的「throwing comparator」用例只覆盖了无状态 `heapify`，没有覆盖 `Heap` 类的方法。

**修复建议**（任选其一）：
1. 在 `Heap` 方法的 JS 比较器分支里先操作 `data_` 的副本，成功后再 `swap`（代价是 JS 比较器路径变 O(n)，但原生路径不受影响——可在 `WithOwnCompare` 的 `NativeMinCompare` 分支直接操作 `data_`，`JsCompare` 分支操作副本）：
   ```cpp
   auto draft = data_;
   libheap::heappush(draft, item, cmp);
   data_ = std::move(draft);
   ```
2. 文档化「JS 比较器抛异常后堆状态未定义，应丢弃该 `Heap` 实例」，并补一个对应测试。

无论选哪种，都建议补一个 `Heap` 类的「throwing comparator」测试用例。

### 🟡 [important] `index.js:21-29` — 缺 JSDoc 类型注解，且错误信息删除了修复提示

两个问题：

1. **无 JSDoc / `@ts-check`**：`index.js` 是纯 JS，没有 `// @ts-check` 也没有 JSDoc，本地不做任何类型检查。虽然 `index.d.ts` 给消费者提供了类型，但 `index.js` 自身的拼写错误、参数错位等问题无法被静态发现。
2. **错误信息回退**：相比上一个 commit（`git diff HEAD -- index.js` 可见），`index.js:26` 把 `'@swifty.js/libheap: native addon not found. Run "pnpm build" (node-gyp rebuild) first.'` 简化成 `'@swifty.js/libheap: Native addon not found.'`，丢失了「运行 `pnpm build`」的修复指引。这是用户最常遇到的报错之一，提示删了会增加支持成本。

**修复建议**：
- 给 `index.js` 加 `// @ts-check` 和 JSDoc，或添加 `tsconfig.json`（`checkJs: true`）做本地类型检查。
- 恢复错误消息里的修复指引：
  ```js
  throw new Error(
    '@swifty.js/libheap: native addon not found. Run "pnpm build" (node-gyp rebuild) first.',
    { cause },
  );
  ```

### 🟡 [important] 缺 `tsconfig.json`，类型声明无法本地校验

项目有 `index.d.ts`，但无 `tsconfig.json`，无法：
- 对 `index.js` 做 `checkJs` 校验；
- 对 `index.d.ts` 做 declaration 一致性校验；
- 在 CI 中跑 `tsc --noEmit` 防止 `.d.ts` 与实际 API 漂移（`NAPI_DISABLE_CPP_EXCEPTIONS` vs `NAPI_CPP_EXCEPTIONS` 就是配置漂移的信号）。

**修复建议**：加一个最小 `tsconfig.json`：
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "checkJs": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["index.js", "index.d.ts", "tests/**/*.js"]
}
```
并在 `package.json` scripts 加 `"typecheck": "tsc --noEmit"`。

---

## 优化建议

### 🟢 [nit] `CMakeLists.txt:57` — `COMMENT COMMENT "..."` 重复关键字

```cmake
COMMENT COMMENT "clang-format -i -style=google ${SOURCE_FILES}"
```
第一个 `COMMENT` 是 CMake 关键字，第二个 `COMMENT` 会被当成注释文本字面量，紧随其后的字符串被忽略或拼接。结果是 `format` target 的注释变成 `"COMMENT"`，并非预期文本。

**修复建议**：删掉一个 `COMMENT`：
```cmake
COMMENT "clang-format -i -style=google ${SOURCE_FILES}"
```

### 🟢 [nit] `CMakeLists.txt:20-21` 与 `28-29` — `CMAKE_CXX_STANDARD_REQUIRED`、`CMAKE_EXPORT_COMPILE_COMMANDS` 重复设置

两次 `set` 同一变量，第二次无意义。删掉重复的 28-29 行即可。

### 🟢 [nit] `CMakeLists.txt:64` — `add_library(addon SHARED src/addon.cc)` 未列出 `src/heap.h`

虽然头文件不需要编译，但显式列出能让 IDE（CMake Tools、CLion）正确追踪头文件依赖、在 `heap.h` 修改时触发重编。

**修复建议**：
```cmake
add_library(addon SHARED src/addon.cc src/heap.h)
```

### 🟢 [nit] `index.d.ts:91` — `Heap` 构造函数签名未覆盖「只传比较器」用法

C++ 层（`addon.cc:229-239`）先判 `IsArray` 再判 `IsFunction`，因此 `new Heap(compareFn)` 是支持的。但 TS 签名 `constructor(items?: number[], compare?: CompareFunction)` 要求 `items` 必须是 `number[]`，`new Heap(compareFn)` 会报类型错误。`bench.js:49` 的 `new Heap([], (a, b) => a - b)` 是显式传空数组绕开的。

**修复建议**：用重载表达更准确的签名：
```ts
constructor();
constructor(items: number[], compare?: CompareFunction);
constructor(compare: CompareFunction);
```

### 🟢 [nit] `index.d.ts:114-115` — `toArray` 返回「heap order」可能令人困惑

```ts
/** Copy the internal heap storage into a new array (heap order). */
toArray(): number[];
```
「heap order」对不熟悉堆的用户不直观——他们可能以为返回的是排序后的数组。建议加一句：「Not sorted; use repeated `pop()` to obtain sorted output.」

### 🟢 [nit] `tests/test.js` / `tests/bench.js` — 纯 JS，未利用 TS 做类型校验

测试文件是 `.js`，调用 `heapify(123)` 这种参数类型错误不会被静态发现。可考虑改为 `.ts`，或在加 `tsconfig.json` 后用 `checkJs` 覆盖测试。

### 🟢 [nit] `src/heap.h:78-80` — `heappop` 单元素时的 self-move-assignment

```cpp
T result = std::move(heap.front());
heap[0] = std::move(heap.back());   // size==1 时是 self-move
heap.pop_back();
```
对 `T = double` 无害；但作为通用模板，对非平凡类型 self-move 是未指定行为。建议加 `if (heap.size() > 1)` 保护，或在注释说明此模板假设 `T` 对 self-move 安全。

### 🟢 [nit] `src/heap.h:35-36` — `2 * index + 1` 理论上对超大堆可能溢出

`size_t` 乘 2 在接近 `SIZE_MAX / 2` 时会溢出。实际堆不会这么大，但模板是泛型的，可在注释说明假设 `index < SIZE_MAX / 2`。

### 💡 [suggestion] `src/addon.cc` — 可考虑增加 `clear()` 与 `Symbol.iterator`

`Heap` 类目前只有 `toArray` 拷贝导出，缺少 `clear()`（O(1) 清空）和 `Symbol.iterator`（便于 `for...of` 消费）。两者实现成本都很低，能提升 API 易用性。

### 💡 [suggestion] `CMakeLists.txt` 与 `binding.gyp` — 未设置 `NAPI_VERSION`

`node-addon-api` 8.x 默认使用某个 `NAPI_VERSION`，但显式指定（如 `-DNAPI_VERSION=9`）可以避免潜在的版本回退、并在编译期校验所用 API 是否在目标 N-API 版本可用。`binding.gyp` 也没设置，建议两处统一加上。

### 💡 [suggestion] `binding.gyp` 与 `CMakeLists.txt` — 两套构建配置无单一事实来源

`binding.gyp`（实际构建）与 `CMakeLists.txt`（IDE 支持）维护两份编译选项、宏定义、C++ 标准，容易漂移（`NAPI_DISABLE_CPP_EXCEPTIONS` vs `NAPI_CPP_EXCEPTIONS` 就是漂移的后果）。建议要么去掉 CMake（仅用 node-gyp，`compile_commands.json` 由 `node-gyp` 生成），要么用 `cmake-js` 统一构建入口。

---

## 改进优先级

1. **修 `CMakeLists.txt` 的 `NAPI_DISABLE_CPP_EXCEPTIONS`**（blocking，进程会崩）
2. **修 CMake 产物名 `heapaddon.node` → `heap.node`**（CMake 构建完全不可用）
3. **修 `GLOB_RECURSE` 误匹配 `node_modules`**（`format` target 会污染第三方代码）
4. **`Heap` 类方法在 JS 比较器抛异常时的回滚或文档化**（数据损坏风险）
5. **`index.js` 加 JSDoc/`@ts-check` + 恢复错误修复提示**
6. **加 `tsconfig.json` 与 `typecheck` script**（防止 `.d.ts` 漂移）
7. **修 CMake 编译器/生成器设置位置**（当前设置无效）
8. **清理 `COMMENT COMMENT`、重复 `set` 等小问题**
9. **`index.d.ts` 构造函数重载 + `toArray` 注释**
10. **可选：`clear()` / `Symbol.iterator` / `NAPI_VERSION` / 统一构建系统**

## 总体评价

核心算法（`src/heap.h`）实现正确、契约清晰，N-API 绑定层（`src/addon.cc`）设计合理（双 API + 比较器分发 + NaN 拒绝），测试覆盖到位（18/18 通过）。主要问题集中在两处：

- **`CMakeLists.txt` 几乎不可用**：异常宏反了、产物名错了、编译器/生成器设置位置错了、`GLOB_RECURSE` 会污染 `node_modules`。虽然注释说「仅 IDE 支持」，但 `package.json` 暴露了 `cmake` 脚本，用户会误用。建议要么修好，要么直接删除 CMake 入口。
- **JS 侧类型支持不闭环**：`.d.ts` 写得不错，但 `index.js` 本身无 `@ts-check`、无 `tsconfig.json`，`.d.ts` 与实现之间没有静态校验保障，已经出现 `NAPI_DISABLE_CPP_EXCEPTIONS` 这类配置漂移迹象。

算法侧只有一个值得讨论的问题：`Heap` 类在 JS 比较器抛异常时不回滚。建议补一个针对 `Heap` 类的「throwing comparator」测试用例，并按上述方案修复或文档化。

无功能回归，但建议在合入前处理掉上述 1-6 项。
