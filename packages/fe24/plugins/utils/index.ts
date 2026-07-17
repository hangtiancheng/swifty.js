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

export function getTime() {
  const pad0 = (num: number) => num.toString().padStart(2, "0");
  const time = new Date();
  return `${pad0(time.getHours())}:${pad0(time.getMinutes())}:${pad0(time.getSeconds())}`;
}

export function randNum(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from)) + from;
}

export function randArr(from: number, to: number, len: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(randNum(from, to));
  }
  return arr;
}
