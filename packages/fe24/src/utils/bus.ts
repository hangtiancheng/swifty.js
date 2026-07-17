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

/* eslint-disable @typescript-eslint/no-explicit-any */
type IBus = {
  publish: (eventName: string, ...args: any[]) => void;
  subscribe: (eventName: string, callback: ICallback) => void;
  unsubscribe: (eventName: string, callback: ICallback) => void;
};

type ICallback = (...args: any[]) => void;
type IEventName2callbacks = Map<string, ICallback[]>;

class Bus implements IBus {
  static #instance: Bus;

  private constructor(
    private eventName2callbacks: IEventName2callbacks = new Map<
      string,
      ICallback[]
    >(),
  ) {}

  public static get instance(): Bus {
    if (!Bus.#instance) {
      Bus.#instance = new Bus();
    }
    return Bus.#instance;
  }

  publish(eventName: string, ...args: any[]): void {
    const callbacks = this.eventName2callbacks.get(eventName);
    if (callbacks) {
      callbacks.forEach((cb) => cb.apply(this, args));
    }
  }

  subscribe(eventName: string, cb: ICallback): void {
    const callbacks = this.eventName2callbacks.get(eventName) ?? [];
    callbacks.push(cb);
    this.eventName2callbacks.set(eventName, callbacks);
  }

  unsubscribe(eventName: string, cb: ICallback): void {
    const callbacks = this.eventName2callbacks.get(eventName);
    if (callbacks) {
      const idx = callbacks.indexOf(cb);
      if (idx !== -1) {
        callbacks.splice(idx, 1);
      }
    }
  }
}

export default Bus.instance;
