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

import { useSyncExternalStore, useRef } from "react";

type GetStateSlice<TState> = (state: TState) => TState | Partial<TState>;

type StateSlice<TState> = TState | Partial<TState> | GetStateSlice<TState>;

type StateCreator<TState> = (
  set: (partial: StateSlice<TState>, replace?: boolean) => void,
  get: () => TState,
) => TState;

type Listener<TState> = (newState: TState, oldState: TState) => void;

type Off = () => void;

interface IStore<TState> {
  getState: () => TState;
  setState: (partial: StateSlice<TState>, replace?: boolean) => void;
  subscribe: (listener: Listener<TState>) => Off;
}

function createStore<TState extends object>(
  createState: StateCreator<TState>,
): IStore<TState> {
  let state: TState;
  const listeners = new Set<Listener<TState>>();

  const getState = () => state;

  const setState = (partial: StateSlice<TState>, replace?: boolean) => {
    const nextState =
      typeof partial === "function"
        ? (partial as GetStateSlice<TState>)(getState())
        : (partial as TState | Partial<TState>);

    if (Object.is(state, nextState)) {
      return;
    }

    const oldState = state;
    // When replace is true, swap the entire state reference;
    // otherwise perform a shallow merge (spread).
    state = replace
      ? (nextState as TState)
      : { ...state, ...(nextState as Partial<TState>) };

    // NOTE: Reentrant setState calls within a listener callback are not
    // guarded against. Subsequent listeners in the same notification cycle
    // may observe a stale oldState if an earlier listener triggers another
    // setState. This is acceptable for a lightweight implementation.
    listeners.forEach((listener) => listener(state, oldState));
  };

  const subscribe = (listener: Listener<TState>): Off => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  state = createState(setState, getState);

  return { getState, setState, subscribe };
}

function useStore<TState extends object, TSelected>(
  store: IStore<TState>,
  selector: (state: TState) => TSelected = (s) => s as unknown as TSelected,
  isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
): TSelected {
  // Cache the last selected value to preserve referential stability.
  // useSyncExternalStore compares snapshots via Object.is; returning the
  // same reference when the selected slice is logically equal prevents
  // unnecessary re-renders.
  const cache = useRef<{ hasValue: boolean; value?: TSelected }>({
    hasValue: false,
  });

  const getSnapshot = (): TSelected => {
    const next = selector(store.getState());
    if (
      cache.current.hasValue &&
      isEqual(cache.current.value as TSelected, next)
    ) {
      return cache.current.value as TSelected;
    }
    cache.current = { hasValue: true, value: next };
    return next;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function create<TState extends object>(
  createState: StateCreator<TState>,
) {
  const store = createStore<TState>(createState);

  function useBoundStore(): TState;
  function useBoundStore<TSelected>(
    selector: (state: TState) => TSelected,
    isEqual?: (a: TSelected, b: TSelected) => boolean,
  ): TSelected;
  function useBoundStore<TSelected>(
    selector?: (state: TState) => TSelected,
    isEqual?: (a: TSelected, b: TSelected) => boolean,
  ) {
    return useStore(store, selector as (state: TState) => TSelected, isEqual);
  }

  // Expose the store API on the hook itself so consumers can call
  // getState / setState / subscribe outside of React components.
  return Object.assign(useBoundStore, store);
}
