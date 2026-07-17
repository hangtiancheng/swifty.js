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

type TState = "PENDING" | "FULFILLED" | "REJECTED";

class Deferred<T> {
  public state: TState;
  public promise: Promise<T>;

  private nativeResolve: (value: T | PromiseLike<T>) => void;
  private nativeReject: (reason?: any) => void;

  static PENDING: TState = "PENDING";
  static FULFILLED: TState = "FULFILLED";
  static REJECTED: TState = "REJECTED";

  constructor() {
    this.state = Deferred.PENDING;
    this.nativeResolve = () => {};
    this.nativeReject = () => {};

    this.promise = new Promise((resolve, reject) => {
      this.nativeResolve = resolve;
      this.nativeReject = reject;
    });
  }

  reject(reason?: any): void {
    if (this.state !== Deferred.PENDING) {
      return;
    }
    this.state = Deferred.REJECTED;
    this.nativeReject(reason);
  }

  resolve(value: T | PromiseLike<T>): void {
    if (this.state !== Deferred.PENDING) {
      return;
    }
    this.state = Deferred.FULFILLED;
    this.nativeResolve(value);
  }
}

export default Deferred;
