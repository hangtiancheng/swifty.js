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
import { getEntry, setEntry, waitForEntry, type PrivatePageEntry } from "../src/client/registry";
import type { EncryptedPayload } from "../src/shared/payload";

function payload(encrypted: string): EncryptedPayload {
  return { encrypted, authTag: "t", salt: "s", iv: "i" };
}

describe("registry waiters", () => {
  it("notifies a waiter when the entry registers after subscription", () => {
    const seen: PrivatePageEntry[] = [];
    waitForEntry("late.md", (entry) => seen.push(entry));
    expect(getEntry("late.md")).toBeUndefined();

    const onUnlocked = vi.fn();
    setEntry("late.md", payload("abc"), onUnlocked);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(getEntry("late.md"));
    expect(seen[0]?.payload.encrypted).toBe("abc");
  });

  it("flushes each waiter once — a later re-registration does not re-notify", () => {
    const notify = vi.fn();
    waitForEntry("once.md", notify);
    setEntry("once.md", payload("v1"), () => {});
    setEntry("once.md", payload("v2"), () => {});
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe prevents notification", () => {
    const notify = vi.fn();
    const unsubscribe = waitForEntry("gone.md", notify);
    unsubscribe();
    setEntry("gone.md", payload("abc"), () => {});
    expect(notify).not.toHaveBeenCalled();
  });

  it("supports multiple waiters for the same key", () => {
    const first = vi.fn();
    const second = vi.fn();
    waitForEntry("multi.md", first);
    waitForEntry("multi.md", second);
    setEntry("multi.md", payload("abc"), () => {});
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("keeps the plaintext cache across re-registration with unchanged ciphertext", () => {
    setEntry("cache.md", payload("same"), () => {});
    const entry = getEntry("cache.md");
    expect(entry).toBeDefined();
    entry!.plaintext = "decrypted";

    setEntry("cache.md", payload("same"), () => {});
    expect(getEntry("cache.md")?.plaintext).toBe("decrypted");

    setEntry("cache.md", payload("changed"), () => {});
    expect(getEntry("cache.md")?.plaintext).toBeUndefined();
  });
});
