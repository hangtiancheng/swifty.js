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

import constructor from "../types/constructor";
import { DelayedConstructor } from "../lazy-helpers";
import Transform from "../types/transform";

type InjectionToken<T = any> =
  constructor<T> | string | symbol | DelayedConstructor<T>;

export function isNormalToken(
  token?: InjectionToken<any>,
): token is string | symbol {
  return typeof token === "string" || typeof token === "symbol";
}

export function isTokenDescriptor(
  descriptor: any,
): descriptor is TokenDescriptor {
  return (
    typeof descriptor === "object" &&
    "token" in descriptor &&
    "multiple" in descriptor
  );
}

export function isTransformDescriptor(
  descriptor: any,
): descriptor is TransformDescriptor {
  return (
    typeof descriptor === "object" &&
    "token" in descriptor &&
    "transform" in descriptor
  );
}

export function isConstructorToken(
  token?: InjectionToken<any>,
): token is constructor<any> | DelayedConstructor<any> {
  return typeof token === "function" || token instanceof DelayedConstructor;
}

export interface TokenDescriptor {
  token: InjectionToken<any>;
  multiple: boolean;
  isOptional?: boolean;
}

export interface TransformDescriptor {
  token: InjectionToken<any>;
  transform: InjectionToken<Transform<any, any>>;
  transformArgs: any[];
}

export default InjectionToken;
