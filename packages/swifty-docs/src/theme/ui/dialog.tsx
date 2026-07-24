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

import type { ComponentChildren, Ref } from "preact";
import { createContext } from "preact";
import { useContext, useEffect, useRef } from "preact/hooks";
import { createPortal } from "preact/compat";
import { cn } from "../lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue>({
  open: true,
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
  return (
    <div
      class={cn(
        "bg-foreground/25 animate-overlay-in fixed inset-0 z-50 backdrop-blur-[2px] dark:bg-black/50",
        className,
      )}
    />
  );
}

interface DialogContentProps {
  class?: string;
  ref?: Ref<HTMLDivElement>;
  children: ComponentChildren;
}

export function DialogContent({
  class: className,
  ref,
  children,
}: DialogContentProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    innerRef.current?.focus();
  }, []);

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
      class={cn(
        "border-border bg-card text-card-foreground shadow-foreground/10 animate-dialog-in fixed z-50 flex flex-col overflow-hidden rounded-xl border shadow-2xl outline-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

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
