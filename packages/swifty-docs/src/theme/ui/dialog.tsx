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

import type { ComponentChildren } from "preact";
import { createContext } from "preact";
import { useContext, useEffect, useRef } from "preact/hooks";
import { createPortal, forwardRef } from "preact/compat";
import { cn } from "../lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default closed: a DialogPortal used outside a <Dialog> must not render
// unconditionally.
const DialogContext = createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ComponentChildren;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogPortal({ children }: { children: ComponentChildren }) {
  const { open } = useContext(DialogContext);
  if (!open) return null;
  return createPortal(<>{children}</>, document.body);
}

export function DialogOverlay({ class: className }: { class?: string }) {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <div
      aria-hidden="true"
      // Standard modal behavior: clicking the backdrop dismisses the dialog.
      // Clicks inside DialogContent never reach here — it is a sibling
      // stacked above the overlay, not a child.
      onClick={() => onOpenChange(false)}
      class={cn(
        "bg-foreground/25 animate-overlay-in fixed inset-0 z-50 backdrop-blur-[2px] dark:bg-black/50",
        className,
      )}
    />
  );
}

interface DialogContentProps {
  class?: string;
  children: ComponentChildren;
}

// forwardRef is required: Preact 10 never puts `ref` into a function
// component's props (destructuring it always yielded undefined), so the
// forwarded ref used to silently point at the component instance.
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ class: className, children }, ref) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      // Remember the invoking control so focus can be restored on close —
      // otherwise keyboard users are dropped at the top of the document.
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      innerRef.current?.focus();
      return () => returnFocusRef.current?.focus();
    }, []);

    // Minimal focus trap: keep Tab cycling inside the dialog. aria-modal
    // alone does not prevent keyboard focus from escaping to the page.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = innerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const setRef = (el: HTMLDivElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref && typeof ref === "object") ref.current = el;
    };

    return (
      <div
        ref={setRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        class={cn(
          "border-border bg-card text-card-foreground shadow-foreground/10 animate-dialog-in fixed z-50 flex flex-col overflow-hidden rounded-xl border shadow-2xl outline-none",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

export function DialogAccessibleTitle({
  children,
}: {
  children: ComponentChildren;
}) {
  return <h2 class="sr-only">{children}</h2>;
}

export function DialogTitle({
  children,
  class: className,
}: {
  children: ComponentChildren;
  class?: string;
}) {
  return <h2 class={className}>{children}</h2>;
}

export function DialogDescription({
  children,
  class: className,
}: {
  children: ComponentChildren;
  class?: string;
}) {
  return <p class={className}>{children}</p>;
}

export function DialogClose({
  children,
  class: className,
}: {
  children: ComponentChildren;
  class?: string;
}) {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <button type="button" class={className} onClick={() => onOpenChange(false)}>
      {children}
    </button>
  );
}

export function DialogTrigger({
  children,
  class: className,
}: {
  children: ComponentChildren;
  class?: string;
}) {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <button type="button" class={className} onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}
