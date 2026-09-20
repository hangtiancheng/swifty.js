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

import { useMemo, useRef } from "react";
import isDev from "../utils/is-dev.js";

type anyFunc = (this: any, ...args: any[]) => any;

type PickFunction<T extends anyFunc> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

export function useMemorizedFn<T extends anyFunc>(fn: T): PickFunction<T> {
  if (isDev) {
  }

  const fnRef = useRef<T>(fn);
  fnRef.current = useMemo<T>(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T> | undefined>(undefined);
  if (!memoizedFn.current) {
    memoizedFn.current = function (
      this: ThisParameterType<T>,
      ...args: Parameters<T>
    ) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current;
}

export default useMemorizedFn;

export function usePersistFn<T extends anyFunc>(fn: T): PickFunction<T> {
  if (isDev) {
  }

  const fnRef = useRef<T>(fn);

  const memoizedFn = useRef<PickFunction<T> | undefined>(undefined);
  if (!memoizedFn.current) {
    memoizedFn.current = function (
      this: ThisParameterType<T>,
      ...args: Parameters<T>
    ) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current;
}
