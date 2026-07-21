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
  return function set<T extends object>(
    target: T,
    key: string,
    value: unknown,
  ): boolean {
    if (isReadonly) {
      console.warn(
        `readonly key=${key.toString()}, value=${JSON.stringify(value)}`,
      );
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
