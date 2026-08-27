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
import type { EncryptedPayload } from "../../shared/payload";
import { decryptContent } from "../crypto";
import { sharedStyles } from "../styles";
import { lockIcon, xIcon } from "./icons";

export interface UnlockDetail {
  plaintext: string;
  password: string;
}

function shake(el: HTMLElement): void {
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(3px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 400, easing: "ease-in-out" },
  );
}

/**
 * Modal password prompt. Fires `vpd-unlock` ({@link UnlockDetail}) after a
 * successful decryption and `vpd-close` when dismissed.
 */
export class VpdPasswordDialog extends LitElement {
  static override styles = sharedStyles;

  static override properties = {
    payload: { attribute: false },
    _value: { state: true },
    _error: { state: true },
    _checking: { state: true },
  };

  declare payload: EncryptedPayload | undefined;
  declare private _value: string;
  declare private _error: string;
  declare private _checking: boolean;

  constructor() {
    super();
    this._value = "";
    this._error = "";
    this._checking = false;
  }

  override firstUpdated(): void {
    const dialog = this.renderRoot.querySelector("dialog");
    dialog?.showModal();
    this.renderRoot.querySelector("input")?.focus();
  }

  private _emitClose(): void {
    this.dispatchEvent(new CustomEvent("vpd-close", { bubbles: true, composed: true }));
  }

  private _onInput(e: Event): void {
    this._value = (e.target as HTMLInputElement).value;
    this._error = "";
  }

  private async _onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    if (!this._value.trim() || this._checking || !this.payload) return;
    this._checking = true;
    try {
      const plaintext = await decryptContent(this.payload, this._value);
      this.dispatchEvent(
        new CustomEvent<UnlockDetail>("vpd-unlock", {
          detail: { plaintext, password: this._value },
          bubbles: true,
          composed: true,
        }),
      );
    } catch {
      this._error = "Incorrect password, please try again.";
      this._checking = false;
      const dialog = this.renderRoot.querySelector("dialog");
      if (dialog) shake(dialog);
      this.renderRoot.querySelector("input")?.select();
    }
  }

  override render() {
    return html`
      <dialog
        class="fixed inset-0 m-auto w-[min(92vw,24rem)] rounded-xl border border-(--vp-c-divider) bg-(--vp-c-bg) p-8 text-(--vp-c-text-1) shadow-2xl outline-none backdrop:bg-(--vp-backdrop-bg-color) backdrop:backdrop-blur-[6px]"
        @close=${this._emitClose}
      >
        <form class="flex flex-col" @submit=${this._onSubmit}>
          <button
            type="button"
            aria-label="Close"
            class="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--vp-c-text-3) transition-colors duration-150 hover:bg-(--vp-c-bg-soft) hover:text-(--vp-c-text-1)"
            @click=${() => this.renderRoot.querySelector("dialog")?.close()}
          >
            ${xIcon(15)}
          </button>

          <div
            class="mb-5 flex size-12 items-center justify-center rounded-lg border border-(--vp-c-divider) bg-(--vp-c-bg-soft) text-(--vp-c-brand-1)"
          >
            ${lockIcon(24)}
          </div>

          <h2 class="m-0 text-[1.05rem] font-bold tracking-tight">Password Required</h2>
          <p class="mt-1 mb-5 text-[0.82rem] text-(--vp-c-text-2)">
            This page is private. Enter the password to view its content.
          </p>

          <input
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            class="${
              this._error
                ? "border-(--vp-c-danger-1)"
                : "border-(--vp-c-divider) focus:border-(--vp-c-brand-1)"
            } w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-(--vp-c-text-1) transition-colors outline-none placeholder:text-(--vp-c-text-3)"
            .value=${this._value}
            @input=${this._onInput}
          />
          ${
            this._error
              ? html`<p class="m-0 mt-2 text-[0.78rem] font-medium text-(--vp-c-danger-1)">
                  ${this._error}
                </p>`
              : nothing
          }

          <button
            type="submit"
            ?disabled=${this._checking}
            class="mt-5 w-full cursor-pointer rounded-lg border-0 bg-(--vp-button-brand-bg,var(--vp-c-brand-3)) px-4 py-2.5 text-sm font-semibold text-(--vp-button-brand-text) transition-colors duration-150 hover:bg-(--vp-button-brand-hover-bg,var(--vp-c-brand-2)) disabled:cursor-not-allowed disabled:opacity-60"
          >
            ${this._checking ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </dialog>
    `;
  }
}
