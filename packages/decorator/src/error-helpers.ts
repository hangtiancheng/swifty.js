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

function formatDependency(params: string | null, idx: number): string {
  if (params === null) {
    return `at position #${idx}`;
  }
  const argName = params.split(",")[idx].trim();
  return `"${argName}" at position #${idx}`;
}

function composeErrorMessage(msg: string, e: Error, indent = "    "): string {
  return [msg, ...e.message.split("\n").map((l) => indent + l)].join("\n");
}

export function formatErrorCtor(
  ctor: constructor<any>,
  paramIdx: number,
  error: Error,
): string {
  const [, params = null] =
    ctor.toString().match(/constructor\(([\w, ]+)\)/) || [];
  const dep = formatDependency(params, paramIdx);
  return composeErrorMessage(
    `Cannot inject the dependency ${dep} of "${ctor.name}" constructor. Reason:`,
    error,
  );
}
