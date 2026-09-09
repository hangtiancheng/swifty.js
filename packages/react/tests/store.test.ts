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

import { describe, expect, it, vi } from "vitest";
import { createStore } from "@lark.js/react";

interface CountState {
  count: number;
  step: number;
  increment: () => void;
}

function makeStore() {
  return createStore<CountState>((set, get) => ({
    count: 0,
    step: 1,
    increment() {
      set({ count: get().count + get().step });
    },
  }));
}

describe("createStore - subscribe", () => {
  it("subscribe fires on setState with (state, prevState)", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 5 });

    expect(listener).toHaveBeenCalledTimes(1);
    const [newState, prevState] = listener.mock.calls[0];
    expect(newState.count).toBe(5);
    expect(prevState.count).toBe(0);

    store.destroy();
  });

  it("subscribe fires on action call", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.getState().increment();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().count).toBe(1);

    store.destroy();
  });

  it("multi-key setState notifies once", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 9, step: 9 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().count).toBe(9);
    expect(store.getState().step).toBe(9);

    store.destroy();
  });

  it("unsubscribe stops notifications", () => {
    const store = makeStore();
    const listener = vi.fn();
    const off = store.subscribe(listener);

    off();
    store.setState({ count: 10 });

    expect(listener).not.toHaveBeenCalled();
    store.destroy();
  });

  it("setState with no actual change does not notify", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 0 }); // same as initial

    expect(listener).not.toHaveBeenCalled();
    store.destroy();
  });

  it("setState with updater function", () => {
    const store = makeStore();
    store.setState((prev) => ({ count: prev.count + 10 }));
    expect(store.getState().count).toBe(10);
    store.destroy();
  });

  it("selector subscribe fires only when the slice changes", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe((state) => state.count, listener);

    store.setState({ step: 7 }); // unrelated key
    expect(listener).not.toHaveBeenCalled();

    store.setState({ count: 3 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(3, 0);

    store.setState({ count: 4 });
    expect(listener).toHaveBeenLastCalledWith(4, 3);

    store.destroy();
  });

  it("destroy clears listeners and makes setState a no-op", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.destroy();
    store.setState({ count: 99 });

    expect(listener).not.toHaveBeenCalled();
    expect(store.getState().count).toBe(0);
  });
});

describe("createStore - setState semantics", () => {
  it("replace: true resets missing plain keys but preserves actions", () => {
    const store = makeStore();
    store.setState({ count: 5 }, true);

    expect(store.getState().count).toBe(5);
    expect(store.getState().step).toBe(undefined);
    expect(typeof store.getState().increment).toBe("function");

    store.getState().increment(); // count + undefined-step → NaN, but callable
    store.destroy();
  });

  it("writes to action keys are ignored", () => {
    const store = makeStore();
    const original = store.getState().increment;
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ increment: () => {} });

    expect(store.getState().increment).toBe(original);
    expect(listener).not.toHaveBeenCalled();
    store.destroy();
  });

  it("setState can introduce new keys (zustand semantics)", () => {
    interface Extra {
      count: number;
      [k: string]: unknown;
    }
    const store = createStore<Extra>(() => ({ count: 0 }));
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ label: "new" });

    expect(store.getState()["label"]).toBe("new");
    expect(listener).toHaveBeenCalledTimes(1);
    store.destroy();
  });
});

describe("getState (read-only snapshot)", () => {
  it("returns a stable proxy identity", () => {
    const store = makeStore();
    expect(store.getState()).toBe(store.getState());
    store.setState({ count: 1 });
    expect(store.getState()).toBe(store.getState());
    store.destroy();
  });

  it("spread produces a plain snapshot including actions", () => {
    const store = makeStore();
    store.setState({ count: 3 });
    const snap = { ...store.getState() };
    expect(snap.count).toBe(3);
    expect(snap.step).toBe(1);
    expect(typeof snap.increment).toBe("function");
    store.destroy();
  });

  it("direct writes and deletes throw", () => {
    const store = makeStore();
    expect(() => {
      store.getState().count = 42;
    }).toThrow(/read-only/);
    expect(() => {
      // @ts-expect-error deleting a required key
      delete store.getState().count;
    }).toThrow(/read-only/);
    store.destroy();
  });
});
