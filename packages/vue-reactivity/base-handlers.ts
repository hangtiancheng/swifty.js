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

import { isObject } from "@swifty.js/vue-shared";
import { track, trigger } from "./effect";
import { reactive, readonly, ReactiveFlags } from "./reactive";

function createGetter(isReadonly = false, shallow = false) {
  // 拦截 get 操作
  return function get<T extends object>(target: T, key: string): unknown {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const val = Reflect.get(target, key);
    // todo
    // if (shallow) { return val; }
    if (!shallow && isObject(val)) {
      return isReadonly ? readonly(val) : reactive(val);
    }
    if (!isReadonly) {
      // get 时收集依赖
      track(target, key);
    }
    return val;
  };
}

const mutableGet = createGetter(false);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createSetter(isReadonly = false) {
  // 拦截 set 操作
  return function set<T extends object>(target: T, key: string, value: unknown): boolean {
    if (isReadonly) {
      console.warn(`readonly key=${key.toString()}, value=${JSON.stringify(value)}`);
      return true;
    }
    const ok = Reflect.set(target, key, value);
    // set 时触发更新
    trigger(target, key);
    return ok;
  };
}

const mutableSet = createSetter(false);
const readonlySet = createSetter(true);

export const mutableHandler = {
  get: mutableGet,
  set: mutableSet,
};

export const readonlyHandler = {
  get: readonlyGet,
  set: readonlySet,
};

// export const shallowReadonlyHandler = {
//   get: shallowReadonlyGet,
//   set: readonlySet,
// };

export const shallowReadonlyHandler = Object.assign({}, readonlyHandler, {
  get: shallowReadonlyGet,
});
