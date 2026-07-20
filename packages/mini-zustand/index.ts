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

function createStore<TState extends object>(createState: StateCreator<TState>): IStore<TState> {
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
    state = replace ? (nextState as TState) : { ...state, ...(nextState as Partial<TState>) };

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
  const cache = useRef<{ hasValue: boolean; value?: TSelected }>({ hasValue: false });

  const getSnapshot = (): TSelected => {
    const next = selector(store.getState());
    if (cache.current.hasValue && isEqual(cache.current.value as TSelected, next)) {
      return cache.current.value as TSelected;
    }
    cache.current = { hasValue: true, value: next };
    return next;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function create<TState extends object>(createState: StateCreator<TState>) {
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
