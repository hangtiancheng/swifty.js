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

import type { EncryptedPayload } from "../shared/payload";

export const PASSWORD_STORAGE_KEY = "vpd-private-pwd";

export interface PrivatePageEntry {
  payload: EncryptedPayload;
  /** Bumps the page stub's tick so VitePress re-collects the outline. */
  onUnlocked: () => void;
  /** Decrypted envelope, cached for synchronous re-injection on remount. */
  plaintext?: string;
}

const entries = new Map<string, PrivatePageEntry>();

export function setEntry(key: string, payload: EncryptedPayload, onUnlocked: () => void): void {
  // Keep the plaintext cache only while the ciphertext is unchanged —
  // an HMR update re-registers the page with fresh content.
  const existing = entries.get(key);
  const plaintext =
    existing && existing.payload.encrypted === payload.encrypted ? existing.plaintext : undefined;
  entries.set(key, { payload, onUnlocked, plaintext });
}

export function getEntry(key: string): PrivatePageEntry | undefined {
  return entries.get(key);
}
