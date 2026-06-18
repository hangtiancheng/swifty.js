# Rspack HMR Runtime Bug Report: `currentUpdateRuntime` is undefined

## 1. Bug Summary

When running `pnpm dev:rspack` in lark-demo, Rspack dev server may throw:

```
TypeError: Cannot read properties of undefined (reading 'push')
```

at `jsonp_chunk_loading_with_hmr.ejs:42`:

```js
if (runtime) currentUpdateRuntime.push(runtime);
```

`currentUpdateRuntime` is `undefined` at the moment the hot update global callback fires, causing the `.push()` call to crash.

---

## 2. Reproduction

- Project: `packages/lark-demo`
- Command: `pnpm dev:rspack` (runs `rspack serve` with `devServer.hot: true`)
- Trigger: Make any file change after the dev server starts (e.g., edit a view or component file)
- Result: Browser console throws TypeError on the first HMR update

The bug is intermittent ("may error") because it depends on the timing of the HMR update relative to script execution order.

---

## 3. Root Cause Analysis

### 3.1 Two Runtime Chunks in the Same Page

The lark-demo `rspack.config.ts` has:

```ts
entry: "./src/remote-entry.ts",
// no optimization.runtimeChunk config (defaults to false)
plugins: [
  new rspack.container.ModuleFederationPlugin({
    name: "lark_demo",
    filename: "remoteEntry.js",
    exposes: { "./counter-view": "./src/exposed/counter-view.ts" },
    shared: { "@lark.js/mvc": { singleton: true, requiredVersion: "*" } },
  }),
]
```

This creates two independent entry points:

| Entry Name  | Source                                                  | Output File         |
| ----------- | ------------------------------------------------------- | ------------------- |
| `main`      | `entry: "./src/remote-entry.ts"`                        | `js/main.[hash].js` |
| `lark_demo` | MF container (auto-created by `ModuleFederationPlugin`) | `remoteEntry.js`    |

Since `optimization.runtimeChunk` defaults to `false`, each entry chunk IS its own runtime chunk. The generated `dist-rspack/index.html` confirms both are loaded:

```html
<script defer src="js/main.a161d38f.js"></script>
<script defer src="remoteEntry.js"></script>
```

### 3.2 Both Runtime Chunks Register the Same Global HMR Callback

Each runtime chunk includes `JsonpChunkLoadingRuntimeModule` with HMR support (because `devServer.hot: true`). Each chunk's generated code contains:

```js
// From jsonp_chunk_loading_with_hmr.ejs:35
self["rspackHotUpdate_lark_demo"] = function (chunkId, moreModules, runtime) {
  for (var moduleId in moreModules) {
    if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      currentUpdate[moduleId] = moreModules[moduleId];
      if (currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
    }
  }
  if (runtime) currentUpdateRuntime.push(runtime); // LINE 42: THE CRASH POINT
  if (waitingUpdateResolves[chunkId]) {
    waitingUpdateResolves[chunkId]();
    waitingUpdateResolves[chunkId] = undefined;
  }
};
```

The global callback name `rspackHotUpdate_lark_demo` is derived from `output.hot_update_global`, which defaults to `rspackHotUpdate{unique_name}`. This is a compilation-wide setting -- both entries use the SAME name.

Since both scripts execute in the same browser page, the second script (`remoteEntry.js`, loaded after `main.js` due to `defer` ordering) OVERWRITES the first script's callback.

### 3.3 `currentUpdateRuntime` is Local to Each Chunk's Closure

Each runtime chunk's generated code also includes `javascript_hot_module_replacement.ejs`, which declares:

```js
// javascript_hot_module_replacement.ejs:4
var currentUpdateRuntime; // undefined, NOT initialized
```

This is a plain `var` declaration -- it is local to each chunk's closure scope. Each chunk has its OWN `currentUpdateRuntime` variable.

`currentUpdateRuntime` is only initialized to `[]` inside the HMR download handler:

```js
// javascript_hot_module_replacement.ejs:425-440
__webpack_require__.hmrD.jsonp = function (
  chunkIds,
  removedChunks,
  removedModules,
  promises,
  applyHandlers,
  updatedModulesList,
) {
  applyHandlers.push(applyHandler);
  currentUpdateChunks = {};
  currentUpdateRemovedChunks = removedChunks;
  currentUpdate = removedModules.reduce(function (obj, key) {
    obj[key] = false;
    return obj;
  }, {});
  currentUpdateRuntime = []; // LINE 440: ONLY initialized here
  chunkIds.forEach(function (chunkId) {
    if (
      Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
      installedChunks[chunkId] !== undefined
    ) {
      promises.push(loadUpdateChunk(chunkId, updatedModulesList));
      currentUpdateChunks[chunkId] = true;
    } else {
      currentUpdateChunks[chunkId] = false;
    }
  });
};
```

### 3.4 The Crash Sequence

When a file change triggers an HMR update:

```
Step 1: WebSocket receives "hash" message
Step 2: HMR client calls hotCheck()
Step 3: hotCheck() fetches manifest via HMR_DOWNLOAD_MANIFEST
Step 4: Client calls __webpack_require__.hmrD.jsonp() on the MAIN entry's runtime
         -> main's currentUpdateRuntime = []          (initialized!)
         -> calls loadUpdateChunk() which injects <script> tag
Step 5: Hot update chunk loads and executes:
         self["rspackHotUpdate_lark_demo"](chunkId, modules, runtime)
         -> BUT this callback was OVERWRITTEN by remoteEntry.js!
         -> It references remoteEntry.js's closure
         -> remoteEntry.js's currentUpdateRuntime is still undefined
Step 6: currentUpdateRuntime.push(runtime)
         -> TypeError: Cannot read properties of undefined (reading 'push')
```

The core issue: the HMR download handler runs in chunk A's scope (initializing A's `currentUpdateRuntime`), but the global callback executes in chunk B's scope (where `currentUpdateRuntime` was never initialized).

### 3.5 State Sharing Asymmetry

This bug is a consequence of an asymmetry in how HMR state is shared between runtime chunks:

| Variable                     | Sharing Mechanism                                           | Shared? |
| ---------------------------- | ----------------------------------------------------------- | ------- |
| `installedChunks`            | `__webpack_require__.hmrS_jsonp` (shared via require scope) | Yes     |
| `currentUpdateRuntime`       | Plain `var` (local to chunk closure)                        | No      |
| `currentUpdate`              | Plain `var` (local to chunk closure)                        | No      |
| `currentUpdateRemovedChunks` | Plain `var` (local to chunk closure)                        | No      |
| `currentUpdateChunks`        | Plain `var` (local to chunk closure)                        | No      |

`installedChunks` correctly uses the `render_hmr_runtime_state_expression` mechanism to share state across chunks via `__webpack_require__.hmrS_jsonp`. But `currentUpdateRuntime` and its companion variables are plain `var` declarations that are NOT shared.

The sharing mechanism works as follows (in `jsonp_chunk_loading.rs:274-289`):

```rust
// For installedChunks -- SHARED via require scope:
format!("var installedChunks = {}{};",
    match with_hmr {
        true => {
            let state_expression =
                render_hmr_runtime_state_expression(runtime_template, "jsonp");
            format!("{state_expression} = {state_expression} || ")
            // Generates: __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {...}
        }
        false => String::new(),
    },
    &stringify_chunks(&initial_chunks, 0)
)
```

But `currentUpdateRuntime` has no equivalent mechanism -- it's just:

```js
var currentUpdateRuntime; // local, not shared
```

---

## 4. Contributing Factor: Code Generation Order

In `jsonp_chunk_loading.rs:390-403`, the HMR code is generated in this order:

```rust
if with_hmr {
    // FIRST: jsonp_chunk_loading_with_hmr.ejs
    //   (SETS the global callback -- USES currentUpdateRuntime)
    let source_with_hmr = runtime_template.render(
        &self.template_id(TemplateId::WithHmr), ...)?;
    source.push_str(&source_with_hmr);

    // SECOND: javascript_hot_module_replacement.ejs
    //   (DECLARES currentUpdateRuntime)
    let hmr_runtime = generate_javascript_hmr_runtime(
        &self.template_id(TemplateId::HmrRuntime), "jsonp", runtime_template)?;
    source.push_str(&hmr_runtime);
}
```

This means the global callback (which references `currentUpdateRuntime`) is defined BEFORE `currentUpdateRuntime` is declared. While JavaScript `var` hoisting prevents a `ReferenceError`, the variable is `undefined` at the point where the callback is set.

Compare with `module_chunk_loading.rs:437-455`, which has the CORRECT order:

```rust
if with_hmr {
    source.push_str(&format!(r#"
        {}  // FIRST: javascript_hot_module_replacement.ejs (DECLARES)
        {}  // SECOND: module_chunk_loading_with_hmr.ejs (USES)
    "#,
        generate_javascript_hmr_runtime(...)?,
        runtime_template.render(&self.template(TemplateId::WithHMR), ...)?
    ))
}
```

While the order within a single chunk doesn't cause the bug by itself (due to `var` hoisting), the inconsistency between `jsonp_chunk_loading.rs` and `module_chunk_loading.rs` suggests the code generation order was not carefully considered for the JSONP case.

---

## 5. Comparison with Webpack

Webpack 5.107.2 has the identical vulnerability. The same unguarded pattern exists across all five chunk loading modules:

| Webpack File                                              | Line | Vulnerable Code                                                 |
| --------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| `lib/web/JsonpChunkLoadingRuntimeModule.js`               | 361  | `if(runtime) currentUpdateRuntime.push(runtime);`               |
| `lib/node/ReadFileChunkLoadingRuntimeModule.js`           | 245  | `if(runtime) currentUpdateRuntime.push(runtime);`               |
| `lib/node/RequireChunkLoadingRuntimeModule.js`            | 212  | `if(runtime) currentUpdateRuntime.push(runtime);`               |
| `lib/webworker/ImportScriptsChunkLoadingRuntimeModule.js` | 195  | `if(runtime) currentUpdateRuntime.push(runtime);`               |
| `lib/esm/ModuleChunkLoadingRuntimeModule.js`              | 377  | `if(updatedRuntime) currentUpdateRuntime.push(updatedRuntime);` |

None of them guard against `currentUpdateRuntime` being undefined.

Webpack's `currentUpdateRuntime` is also declared as `var currentUpdateRuntime;` (undefined) and only initialized inside the HMR download/invalidate handlers. The HMR runtime code in Rspack was directly ported from webpack, inheriting this design flaw.

---

## 6. Suggested Fixes

### Fix A: Defensive Guard (Immediate Fix)

Add an undefined check in `jsonp_chunk_loading_with_hmr.ejs:42`:

```diff
- if (runtime) currentUpdateRuntime.push(runtime);
+ if (runtime && currentUpdateRuntime) currentUpdateRuntime.push(runtime);
```

Apply the same fix to all five chunk loading templates. This prevents the crash but silently drops the runtime update, which may cause incomplete HMR behavior.

### Fix B: Eager Initialization (Better Fix)

Initialize `currentUpdateRuntime` at declaration time in `javascript_hot_module_replacement.ejs:4`:

```diff
- var currentUpdateRuntime;
+ var currentUpdateRuntime = [];
```

This ensures the variable is always an array, even before the HMR download handler runs. The download handler at line 440 would still reset it to `[]` on each update cycle.

### Fix C: Share HMR State via `__webpack_require__.hmrS_*` (Proper Fix)

Use the same sharing mechanism as `installedChunks` for all HMR state variables:

```js
// Instead of:
var currentUpdateRuntime;

// Use:
var currentUpdateRuntime = (__webpack_require__.hmrS_runtime =
  __webpack_require__.hmrS_runtime || []);
```

This ensures all runtime chunks share the same `currentUpdateRuntime` array, eliminating the root cause of the conflict.

### Fix D: Deduplicate HMR Runtime Modules (Architectural Fix)

When multiple runtime chunks exist in the same compilation, only ONE should register the HMR global callback. The other chunks should delegate to the shared state. Alternatively, make the global callback name unique per runtime chunk (e.g., append chunk ID).

### Fix E: User-Level Workaround

In `rspack.config.ts`, force a single runtime chunk:

```ts
optimization: {
    runtimeChunk: "single",
    // ... existing splitChunks config
}
```

This merges both entries' runtime code into a single chunk, eliminating the callback conflict. However, this may affect Module Federation shared scope initialization timing.

---

## 7. Key Source Files

| File                                                                                            | Role                                                                                                      |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `crates/rspack_plugin_runtime/src/runtime_module/runtime/jsonp_chunk_loading_with_hmr.ejs`      | Defines `loadUpdateChunk()` and the global hot update callback (line 42 is the crash point)               |
| `crates/rspack_plugin_runtime/src/runtime_module/runtime/javascript_hot_module_replacement.ejs` | Declares `currentUpdateRuntime` (line 4), initializes it (lines 416, 440), and iterates it (line 282)     |
| `crates/rspack_plugin_runtime/src/runtime_module/jsonp_chunk_loading.rs`                        | Controls code generation order (lines 390-403: USE before DECLARE)                                        |
| `crates/rspack_plugin_runtime/src/runtime_module/module_chunk_loading.rs`                       | Reference for correct code generation order (lines 437-455: DECLARE before USE)                           |
| `crates/rspack_plugin_runtime/src/runtime_module/utils.rs`                                      | `render_hmr_runtime_state_expression` (lines 65-78) and `generate_javascript_hmr_runtime` (lines 248-260) |
| `crates/rspack_plugin_runtime/src/jsonp_chunk_loading.rs`                                       | Plugin that decides which chunks get `JsonpChunkLoadingRuntimeModule` (lines 55-65)                       |
| `crates/rspack_plugin_mf/src/container/container_plugin.rs`                                     | MF container entry creation (lines 68-97)                                                                 |
| `crates/rspack/src/builder/mod.rs`                                                              | Default `hot_update_global` naming (lines 2800-2805)                                                      |

---

## 8. Summary

The bug is caused by an interaction between three factors:

1. Module Federation creates two entry points (`main` and `lark_demo`), each being its own runtime chunk (since `runtimeChunk: false`).

2. Both runtime chunks are injected into the same HTML page by `HtmlRspackPlugin`, and both register the same global HMR callback (`self["rspackHotUpdate_lark_demo"]`). The second script overwrites the first.

3. `currentUpdateRuntime` is a chunk-local variable, not shared across chunks. When the HMR download handler runs in chunk A's scope but the global callback executes in chunk B's scope, `currentUpdateRuntime` is `undefined` in B, causing the crash.

The fundamental design flaw is the asymmetry between `installedChunks` (correctly shared via `__webpack_require__.hmrS_*`) and `currentUpdateRuntime` (incorrectly local via plain `var`). This is a pattern inherited from webpack, which has the same vulnerability.
