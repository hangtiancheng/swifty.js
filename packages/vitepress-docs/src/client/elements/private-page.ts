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

import { LitElement, html, nothing } from "lit";
import { decryptContent } from "../crypto";
import { getEntry, PASSWORD_STORAGE_KEY, type PrivatePageEntry } from "../registry";
import { sharedStyles } from "../styles";
import { lockIcon } from "./icons";
import type { UnlockDetail } from "./password-dialog";

type GuardState = "checking" | "locked" | "unlocked";

/**
 * Envelope produced by the build-time plugin: `{ html }`. Tolerate a bare
 * HTML string so a malformed envelope degrades to rendering the plaintext
 * instead of a blank page.
 */
function envelopeHtml(plaintext: string): string {
  try {
    const parsed: unknown = JSON.parse(plaintext);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as { html?: unknown }).html === "string"
    ) {
      return (parsed as { html: string }).html;
    }
  } catch {
    // Bare string — use as-is.
  }
  return plaintext;
}

/**
 * In-content guard rendered by generated page stubs. Locked state lives in
 * shadow DOM (isolated from theme CSS); decrypted page HTML is injected
 * into light DOM through a slot so VitePress `.vp-doc` styling and the
 * theme's delegated handlers (copy code, code groups) keep working.
 */
export class VpdPrivatePage extends LitElement {
  static override styles = sharedStyles;

  static override properties = {
    _state: { state: true },
    _dialogOpen: { state: true },
  };

  declare private _state: GuardState;
  declare private _dialogOpen: boolean;

  private _entry: PrivatePageEntry | undefined;

  constructor() {
    super();
    this._state = "checking";
    this._dialogOpen = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._begin();
  }

  private _begin(): void {
    const entry = getEntry(this.dataset["key"] ?? "");
    this._entry = entry;
    if (!entry) {
      this._state = "locked";
      return;
    }
    if (entry.plaintext !== undefined) {
      // Synchronous re-injection: content is in the DOM before VitePress
      // collects the outline in onVnodeMounted.
      this._inject(entry.plaintext);
      this._state = "unlocked";
      return;
    }
    this._state = "checking";
    void this._tryCachedPassword(entry);
  }

  private async _tryCachedPassword(entry: PrivatePageEntry): Promise<void> {
    const cached = readCachedPassword();
    if (cached !== null) {
      try {
        const plaintext = await decryptContent(entry.payload, cached);
        if (!this.isConnected) return;
        this._unlock(entry, plaintext);
        return;
      } catch {
        clearCachedPasswordStorage();
      }
    }
    if (!this.isConnected) return;
    this._state = "locked";
    this._dialogOpen = true;
  }

  private _unlock(entry: PrivatePageEntry, plaintext: string): void {
    entry.plaintext = plaintext;
    this._inject(plaintext);
    this._state = "unlocked";
    this._dialogOpen = false;
    // Bumps the stub's tick: the page component re-renders and VitePress
    // re-collects the outline from the now-injected headings.
    entry.onUnlocked();
  }

  private _inject(plaintext: string): void {
    // Trusted markup: the site author's own markdown, rendered at build
    // time and authenticated by the AES-GCM tag during decryption.
    this.innerHTML = envelopeHtml(plaintext);
  }

  private _onUnlock = (e: Event): void => {
    const { plaintext, password } = (e as CustomEvent<UnlockDetail>).detail;
    try {
      localStorage.setItem(PASSWORD_STORAGE_KEY, password);
    } catch {
      // Storage unavailable (private browsing) — unlock is session-only.
    }
    if (this._entry) this._unlock(this._entry, plaintext);
  };

  override render() {
    if (this._state === "unlocked") return html`<slot></slot>`;
    if (this._state === "checking") return nothing;
    return html`
      <div class="flex min-h-[45vh] flex-col items-center justify-center gap-4 py-10 text-center">
        <div class="text-vpd-text-3">${lockIcon(52)}</div>
        <div>
          <p class="m-0 mb-1.5 text-lg font-bold text-vpd-text-1">This page is private</p>
          <p class="m-0 text-sm text-vpd-text-2">Enter the password to view its content.</p>
        </div>
        <button
          type="button"
          class="mt-1 cursor-pointer rounded-lg border-0 bg-vpd-button px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-vpd-button-hover"
          @click=${() => (this._dialogOpen = true)}
        >
          Unlock
        </button>
      </div>
      ${
        this._dialogOpen && this._entry
          ? html`<vpd-password-dialog
              .payload=${this._entry.payload}
              @vpd-unlock=${this._onUnlock}
              @vpd-close=${() => (this._dialogOpen = false)}
            ></vpd-password-dialog>`
          : nothing
      }
    `;
  }
}

function readCachedPassword(): string | null {
  try {
    return localStorage.getItem(PASSWORD_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearCachedPasswordStorage(): void {
  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
