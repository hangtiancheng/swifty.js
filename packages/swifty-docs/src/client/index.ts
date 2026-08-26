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
import { VpdPasswordDialog } from "./elements/password-dialog";
import { VpdPrivatePage } from "./elements/private-page";
import { PASSWORD_STORAGE_KEY, setEntry } from "./registry";

function defineElements(): void {
  if (typeof window === "undefined" || !window.customElements) return;
  if (!customElements.get("vpd-private-page")) {
    customElements.define("vpd-private-page", VpdPrivatePage);
  }
  if (!customElements.get("vpd-password-dialog")) {
    customElements.define("vpd-password-dialog", VpdPasswordDialog);
  }
}

/**
 * Called by the page stubs that privateDocsPlugin() generates. Registers
 * the encrypted payload for a page and makes sure the guard elements are
 * defined. `onUnlocked` re-renders the page component after unlock so
 * VitePress re-collects the outline.
 */
export function registerPrivatePage(
  key: string,
  payload: EncryptedPayload,
  onUnlocked: () => void,
): void {
  setEntry(key, payload, onUnlocked);
  defineElements();
}

/** Forget the password cached in localStorage after a successful unlock. */
export function clearCachedPassword(): void {
  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

export { decryptContent } from "./crypto";
export { VpdPasswordDialog, VpdPrivatePage };
export type { UnlockDetail } from "./elements/password-dialog";
export type { EncryptedPayload, PrivatePageEnvelope } from "../shared/payload";
