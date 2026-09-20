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

export const isObject = (val: unknown): val is Record<PropertyKey, any> => {
  return val !== null && typeof val === "object";
};

export const isFunction = (val: unknown): val is (...args: any[]) => any => {
  return typeof val === "function";
};

export const isString = (val: unknown): val is string => {
  return typeof val === "string";
};

export const isBoolean = (val: unknown): val is boolean => {
  return typeof val === "boolean";
};

export const isNumber = (val: unknown): val is number => {
  return typeof val === "number" && !Number.isNaN(val);
};

export const isUndefined = (val: unknown): val is undefined => {
  return typeof val === "undefined";
};

export const isNonNullable = <T>(val: T): val is NonNullable<T> => {
  return val !== null && val !== undefined;
};

// 访问 3.then
// 3 自动装箱为 Number 对象
// Number(3).then === undefined
export const isThenable = <T>(val: any): val is PromiseLike<T> => {
  return isNonNullable(val) && isFunction(val.then);
};
