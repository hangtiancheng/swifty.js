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
import { getParamInfo } from "../reflection-helpers";
import { instance as globalContainer } from "../dependency-container";
import {
  isTokenDescriptor,
  isTransformDescriptor,
} from "../providers/injection-token";
import { formatErrorCtor } from "../error-helpers";

/**
 * Class decorator factory that replaces the decorated class' constructor with
 * a parameterless constructor that has dependencies auto-resolved
 *
 * Note: Resolution is performed using the global container
 *
 * @return {Function} The class decorator
 */
function autoInjectable(): (target: constructor<any>) => any {
  return function (target: constructor<any>): constructor<any> {
    const paramInfo = getParamInfo(target);

    return class extends target {
      constructor(...args: any[]) {
        super(
          ...args.concat(
            paramInfo.slice(args.length).map((type, index) => {
              try {
                if (isTokenDescriptor(type)) {
                  if (isTransformDescriptor(type)) {
                    return type.multiple
                      ? globalContainer
                          .resolve(type.transform)
                          .transform(
                            globalContainer.resolveAll(type.token),
                            ...type.transformArgs,
                          )
                      : globalContainer
                          .resolve(type.transform)
                          .transform(
                            globalContainer.resolve(type.token),
                            ...type.transformArgs,
                          );
                  } else {
                    return type.multiple
                      ? globalContainer.resolveAll(type.token)
                      : globalContainer.resolve(type.token);
                  }
                } else if (isTransformDescriptor(type)) {
                  return globalContainer
                    .resolve(type.transform)
                    .transform(
                      globalContainer.resolve(type.token),
                      ...type.transformArgs,
                    );
                }
                return globalContainer.resolve(type);
              } catch (e) {
                const argIndex = index + args.length;
                throw new Error(formatErrorCtor(target, argIndex, e as Error), {
                  cause: e,
                });
              }
            }),
          ),
        );
      }
    };
  };
}

export default autoInjectable;
