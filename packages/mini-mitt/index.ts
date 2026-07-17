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

type TCallback = (...args: unknown[]) => void;

class MiniMitt {
  eventName2callbacks: Map<string, Set<TCallback>>;
  constructor() {
    this.eventName2callbacks = new Map<string, Set<TCallback>>();
  }

  on(eventName: string, callback: TCallback) {
    if (this.eventName2callbacks.has(eventName)) {
      this.eventName2callbacks.get(eventName)?.add(callback);
      return;
    }

    this.eventName2callbacks.set(eventName, new Set<TCallback>([callback]));
  }

  once(eventName: string, callback: TCallback) {
    const wrappedCallback = (...args: unknown[]) => {
      callback.call(undefined, ...args);
      this.off(eventName, wrappedCallback);
    };

    this.on(eventName, wrappedCallback);
  }

  emit(eventName: string, ...args: unknown[]) {
    if (!this.eventName2callbacks.has(eventName)) {
      return;
    }

    this.eventName2callbacks.get(eventName)?.forEach((callback) => callback(...args));
  }

  off(eventName: string, callback: TCallback) {
    if (!this.eventName2callbacks.has(eventName)) {
      return;
    }

    this.eventName2callbacks.get(eventName)?.delete(callback);
    if (this.eventName2callbacks.get(eventName)?.size === 0) {
      this.eventName2callbacks.delete(eventName);
    }
  }

  clear() {
    this.eventName2callbacks.clear();
  }
}

export const miniMitt = new MiniMitt();
