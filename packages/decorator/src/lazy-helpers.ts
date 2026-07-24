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

import constructor from "./types/constructor";

export class DelayedConstructor<T> {
  private reflectMethods: readonly (keyof ProxyHandler<any>)[] = [
    "get",
    "getPrototypeOf",
    "setPrototypeOf",
    "getOwnPropertyDescriptor",
    "defineProperty",
    "has",
    "set",
    "deleteProperty",
    "apply",
    "construct",
    "ownKeys",
  ];

  constructor(private wrap: () => constructor<T>) {}

  public createProxy(createObject: (ctor: constructor<T>) => T): T {
    const target: object = {};
    let init = false;
    let value: T;
    const delayedObject: () => T = (): T => {
      if (!init) {
        value = createObject(this.wrap());
        init = true;
      }
      return value;
    };
    return new Proxy<any>(target, this.createHandler(delayedObject)) as T;
  }

  private createHandler(delayedObject: () => T): ProxyHandler<object> {
    const handler: ProxyHandler<object> = {};
    const install = (name: keyof ProxyHandler<any>): void => {
      handler[name] = (...args: any[]) => {
        args[0] = delayedObject();
        const method = Reflect[name];
        return (method as any)(...args);
      };
    };
    this.reflectMethods.forEach(install);
    return handler;
  }
}

export function delay<T>(
  wrappedConstructor: () => constructor<T>,
): DelayedConstructor<T> {
  if (typeof wrappedConstructor === "undefined") {
    throw new Error(
      "Attempt to `delay` undefined. Constructor must be wrapped in a callback",
    );
  }
  return new DelayedConstructor<T>(wrappedConstructor);
}
