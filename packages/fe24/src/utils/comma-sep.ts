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

// 1234.5678 -> "1,234.5,678"
export function commaSep(num: number): string {
  if (Number.isNaN(num) || typeof num !== "number") {
    throw new TypeError("Expect a number");
  }
  const [integerPart, decimalPart] = num.toString().split(".");
  const sep = integerPart.split("");
  for (let i = integerPart.length - 3; i > 0; i -= 3) {
    sep.splice(i, 0, ",");
  }
  return decimalPart ? sep.join("") + "." + decimalPart : sep.join("");
}
