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

import { create } from "zustand";
import { create as create2 } from "./";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

interface ICntStore {
  cnt: number;
  incCnt: () => void;
  decCnt: () => void;
  resetCnt: () => void;
}

describe("mini-zustand", () => {
  it("create store", () => {
    const useCntStore = create<ICntStore>((set) => ({
      cnt: 0,
      incCnt: () => set((state) => ({ cnt: state.cnt + 1 })),
      decCnt: () => set((state) => ({ cnt: state.cnt - 1 })),
      resetCnt: () => set({ cnt: 0 }),
    }));

    const { result: cnt } = renderHook(() => useCntStore((state) => state.cnt));
    const { result } = renderHook(() => useCntStore());
    expect(cnt.current).toBe(0);

    act(() => result.current.incCnt());
    expect(cnt.current).toBe(1);

    act(() => result.current.resetCnt());
    expect(cnt.current).toBe(0);

    act(() => result.current.decCnt());
    expect(cnt.current).toBe(-1);
  });

  it("create store2", () => {
    const useCntStore2 = create2<ICntStore>((set) => ({
      cnt: 0,
      incCnt: () => set((state) => ({ cnt: state.cnt + 1 })),
      decCnt: () => set((state) => ({ cnt: state.cnt - 1 })),
      resetCnt: () => set({ cnt: 0 }),
    }));

    const { result: cnt } = renderHook(() => useCntStore2((state) => state.cnt));
    const { result } = renderHook(() => useCntStore2());
    expect(cnt.current).toBe(0);

    act(() => result.current.incCnt());
    expect(cnt.current).toBe(1);

    act(() => result.current.resetCnt());
    expect(cnt.current).toBe(0);

    act(() => result.current.decCnt());
    expect(cnt.current).toBe(-1);
  });

  it("selector isolation — unrelated field updates do not re-render", () => {
    interface IMultiStore {
      a: number;
      b: number;
      setA: (v: number) => void;
      setB: (v: number) => void;
    }

    const useMultiStore = create2<IMultiStore>((set) => ({
      a: 0,
      b: 0,
      setA: (v) => set({ a: v }),
      setB: (v) => set({ b: v }),
    }));

    let renderCountA = 0;
    let renderCountB = 0;

    const { result: resultA } = renderHook(() => {
      renderCountA++;
      return useMultiStore((s) => s.a);
    });

    const { result: resultB } = renderHook(() => {
      renderCountB++;
      return useMultiStore((s) => s.b);
    });

    expect(resultA.current).toBe(0);
    expect(resultB.current).toBe(0);
    const initialRendersA = renderCountA;
    const initialRendersB = renderCountB;

    // Update only field "a" — component selecting "b" should NOT re-render
    act(() => useMultiStore.getState().setA(42));

    expect(resultA.current).toBe(42);
    expect(resultB.current).toBe(0);
    expect(renderCountA).toBeGreaterThan(initialRendersA);
    expect(renderCountB).toBe(initialRendersB);
  });

  it("subscribe and unsubscribe", () => {
    const useStore = create2<ICntStore>((set) => ({
      cnt: 0,
      incCnt: () => set((state) => ({ cnt: state.cnt + 1 })),
      decCnt: () => set((state) => ({ cnt: state.cnt - 1 })),
      resetCnt: () => set({ cnt: 0 }),
    }));

    const listener = vi.fn();
    const off = useStore.subscribe(listener);

    act(() => useStore.getState().incCnt());
    expect(listener).toHaveBeenCalledTimes(1);
    // Listener receives the full merged state, not a partial
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ cnt: 1 }),
      expect.objectContaining({ cnt: 0 }),
    );

    off();
    act(() => useStore.getState().incCnt());
    expect(listener).toHaveBeenCalledTimes(1); // not called again after unsubscribe
  });

  it("setState with same reference is a no-op", () => {
    const useStore = create2<{ value: number }>(() => ({ value: 1 }));

    const listener = vi.fn();
    useStore.subscribe(listener);

    const current = useStore.getState();
    act(() => useStore.setState(current));

    expect(listener).not.toHaveBeenCalled();
  });

  it("setState with replace replaces the entire state", () => {
    interface IShape {
      x: number;
      y: number;
    }

    const useStore = create2<IShape>(() => ({ x: 1, y: 2 }));

    act(() => useStore.setState({ x: 10 } as IShape, true));

    // With replace, the state is exactly what was passed — no merge
    expect(useStore.getState()).toEqual({ x: 10 });
    expect(useStore.getState().y).toBeUndefined();
  });

  it("exposes store API on the hook for external access", () => {
    const useStore = create2<ICntStore>((set) => ({
      cnt: 0,
      incCnt: () => set((state) => ({ cnt: state.cnt + 1 })),
      decCnt: () => set((state) => ({ cnt: state.cnt - 1 })),
      resetCnt: () => set({ cnt: 0 }),
    }));

    // getState / setState / subscribe accessible without rendering
    expect(useStore.getState().cnt).toBe(0);
    act(() => useStore.setState({ cnt: 99 }));
    expect(useStore.getState().cnt).toBe(99);
    expect(typeof useStore.subscribe).toBe("function");
  });

  it("derived selector (computed value)", () => {
    interface IPair {
      a: number;
      b: number;
      setA: (v: number) => void;
    }

    const usePairStore = create2<IPair>((set) => ({
      a: 3,
      b: 7,
      setA: (v) => set({ a: v }),
    }));

    const { result } = renderHook(() => usePairStore((s) => s.a + s.b));
    expect(result.current).toBe(10);

    act(() => usePairStore.getState().setA(5));
    expect(result.current).toBe(12);
  });
});
