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

import { useState, useLayoutEffect, useEffect } from "../../hooks";
import { is } from "./util";

/**
 * This is taken from https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js#L84
 * on a high level this cuts out the warnings, ... and attempts a smaller implementation
 * @typedef {{ _value: any; _getSnapshot: () => any }} Store
 */
export function useSyncExternalStore(subscribe, getSnapshot) {
  const value = getSnapshot();

  /**
   * @typedef {{ _instance: Store }} StoreRef
   * @type {[StoreRef, (store: StoreRef) => void]}
   */
  const [{ _instance }, forceUpdate] = useState({
    _instance: { _value: value, _getSnapshot: getSnapshot },
  });

  useLayoutEffect(() => {
    _instance._value = value;
    _instance._getSnapshot = getSnapshot;

    if (didSnapshotChange(_instance)) {
      forceUpdate({ _instance });
    }
  }, [subscribe, value, getSnapshot]);

  useEffect(() => {
    if (didSnapshotChange(_instance)) {
      forceUpdate({ _instance });
    }

    return subscribe(() => {
      if (didSnapshotChange(_instance)) {
        forceUpdate({ _instance });
      }
    });
  }, [subscribe]);

  return value;
}

/** @type {(inst: Store) => boolean} */
function didSnapshotChange(inst) {
  try {
    return !is(inst._value, inst._getSnapshot());
  } catch (error) {
    return true;
  }
}

export function startTransition(cb) {
  cb();
}

export function useDeferredValue(val) {
  return val;
}

export function useTransition() {
  return [false, startTransition];
}

// TODO: in theory this should be done after a VNode is diffed as we want to insert
// styles/... before it attaches
export const useInsertionEffect = useLayoutEffect;
