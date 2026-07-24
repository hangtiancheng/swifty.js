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

/**
 * Built-in password guard for protected pages (docsGuardPlugin).
 *
 * `createContentGuard(loadContent)` wraps the generated `loadContent` so that
 * pages encrypted at build time by `docsGuardPlugin` (frontmatter
 * `protected: true` + `DOCS_PASSWORD` env) prompt for a password before
 * rendering. Mount the returned `<ContentGuard />` once next to
 * `<DocsProvider>`:
 *
 * ```tsx
 * const guard = createContentGuard(loadContent);
 *
 * render(
 *   <>
 *     <guard.ContentGuard />
 *     <DocsProvider config={docsConfig} loadContent={guard.loadContent} …>
 *       …
 *     </DocsProvider>
 *   </>,
 * );
 * ```
 */
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { FunctionComponent } from "preact";
import { renderToString } from "preact-render-to-string";
import { z } from "zod";
import { decryptContent, type EncryptedPayload } from "../utils/guard";
import { LockIcon, XIcon } from "./icons";
import { PageHeadingSchema } from "./lib/content";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "./ui/dialog";

const SESSION_KEY = "docs-guard-pwd";

const DENIED_HTML = renderToString(
  <div class="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center">
    <div class="text-foreground opacity-35 [&>svg]:size-13 [&>svg]:stroke-[1.2]">
      <LockIcon aria-hidden="true" />
    </div>
    <div>
      <p class="mb-1.5 text-lg font-bold">Access Denied</p>
      <p class="text-sm opacity-55">
        This page is password-protected. Enter the correct password to view its
        content.
      </p>
    </div>
  </div>,
);

const EncryptedPayloadSchema = z.object({
  encrypted: z.string(),
  authTag: z.string(),
  salt: z.string(),
  iv: z.string(),
});

function parsePayload(html: string): EncryptedPayload | null {
  try {
    const parsed = EncryptedPayloadSchema.safeParse(JSON.parse(html));
    if (parsed.success) return parsed.data;
  } catch {
    // Not an encrypted payload — plain page HTML.
  }
  return null;
}

// Malformed headings degrade to an empty Toc rather than failing the whole
// envelope (which would render the raw JSON as page HTML).
const DecryptedPageSchema = z.object({
  html: z.string(),
  headings: z.array(PageHeadingSchema).catch([]),
});

interface DecryptedPage {
  html: string;
  headings?: z.infer<typeof PageHeadingSchema>[];
}

/**
 * The build-time plugin encrypts a `{ html, headings }` envelope so the Toc
 * survives the pageData scrub. Payloads produced by older builds contain the
 * raw HTML string; treat those as an envelope without headings.
 */
function parseDecrypted(plaintext: string): DecryptedPage {
  try {
    const parsed = DecryptedPageSchema.safeParse(JSON.parse(plaintext));
    if (parsed.success) return parsed.data;
  } catch {
    // Legacy payload — plain HTML string.
  }
  return { html: plaintext };
}

function shakeElement(el: HTMLElement) {
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

export interface PasswordDialogProps {
  payload: EncryptedPayload;
  onUnlock: (plaintext: string, password: string) => void;
  onClose: () => void;
}

export function PasswordDialog({
  payload,
  onUnlock,
  onClose,
}: PasswordDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: Event) => {
      e.preventDefault();
      if (!value.trim() || checking) return;
      setChecking(true);
      try {
        const plaintext = await decryptContent(payload, value);
        onUnlock(plaintext, value);
      } catch {
        setError("Incorrect password. Please try again.");
        if (cardRef.current) shakeElement(cardRef.current);
        setChecking(false);
        inputRef.current?.select();
      }
    },
    [value, checking, payload, onUnlock],
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay class="z-999 backdrop-blur-[6px]" />
        <div class="fixed inset-0 z-999 grid place-items-center p-4">
          <DialogContent class="w-full max-w-sm p-8" ref={cardRef}>
            <form onSubmit={handleSubmit} class="flex flex-col">
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                class="text-muted-foreground hover:bg-muted absolute top-3 right-3 flex size-7 items-center justify-center rounded-md opacity-60 transition-all duration-150 hover:opacity-100"
              >
                <XIcon size={15} />
              </button>

              <div class="border-border bg-accent text-primary mb-5 flex size-12 items-center justify-center rounded-lg border">
                <LockIcon size={24} strokeWidth={1.5} />
              </div>

              <DialogTitle class="text-[1.05rem] font-bold tracking-tight">
                Password Required
              </DialogTitle>
              <DialogDescription class="text-muted-foreground mt-1 mb-5 text-[0.82rem]">
                This page is protected. Enter the password to view its content.
              </DialogDescription>

              <Input
                ref={inputRef}
                type="password"
                value={value}
                onInput={(e) => {
                  setValue((e.target as HTMLInputElement).value);
                  setError("");
                }}
                placeholder="Password"
                class={cn(
                  "h-auto py-2.5",
                  error &&
                    "border-destructive focus-visible:border-destructive",
                )}
              />
              {error && (
                <p class="text-destructive mt-2 text-[0.78rem] font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={checking}
                class="mt-5 w-full font-semibold"
              >
                {checking ? "Verifying..." : "Unlock"}
              </Button>
            </form>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
}

export interface ContentGuard<
  T extends { contentHtml: string; pageData?: { headings?: unknown } },
> {
  /** Drop-in replacement for the generated `loadContent`. */
  loadContent: (path: string) => Promise<T | null>;
  /** Mount once (outside `<DocsProvider>` is fine) to enable the dialog. */
  ContentGuard: FunctionComponent;
}

export function createContentGuard<
  T extends { contentHtml: string; pageData?: { headings?: unknown } },
>(loadContent: (path: string) => Promise<T | null>): ContentGuard<T> {
  let ask: ((payload: EncryptedPayload) => Promise<string | null>) | null =
    null;

  const unlockPage = (mod: T, plaintext: string): T => {
    const page = parseDecrypted(plaintext);
    const unlocked: T = { ...mod, contentHtml: page.html };
    if (page.headings && unlocked.pageData) {
      unlocked.pageData = {
        ...unlocked.pageData,
        headings: page.headings,
      } as T["pageData"];
    }
    return unlocked;
  };

  const guardedLoadContent = async (path: string): Promise<T | null> => {
    const mod = await loadContent(path);
    if (!mod) return null;

    const payload = parsePayload(mod.contentHtml);
    if (!payload) return mod;

    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try {
        const plaintext = await decryptContent(payload, cached);
        return unlockPage(mod, plaintext);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    const plaintext = ask ? await ask(payload) : null;
    if (plaintext === null) return { ...mod, contentHtml: DENIED_HTML };
    return unlockPage(mod, plaintext);
  };

  function ContentGuardHost() {
    const [dialog, setDialog] = useState<{ payload: EncryptedPayload } | null>(
      null,
    );
    const resolveRef = useRef<((html: string | null) => void) | null>(null);

    const settle = useCallback((html: string | null) => {
      resolveRef.current?.(html);
      resolveRef.current = null;
    }, []);

    useEffect(() => {
      ask = (payload: EncryptedPayload): Promise<string | null> => {
        // A newer request supersedes a pending one: deny the old request
        // instead of leaving its loadContent promise hanging.
        settle(null);
        return new Promise((resolve) => {
          resolveRef.current = resolve;
          setDialog({ payload });
        });
      };
      return () => {
        ask = null;
        settle(null);
      };
    }, [settle]);

    const handleUnlock = useCallback(
      (plaintext: string, password: string) => {
        sessionStorage.setItem(SESSION_KEY, password);
        setDialog(null);
        settle(plaintext);
      },
      [settle],
    );

    const handleClose = useCallback(() => {
      setDialog(null);
      settle(null);
    }, [settle]);

    if (!dialog) return null;
    return (
      <PasswordDialog
        payload={dialog.payload}
        onUnlock={handleUnlock}
        onClose={handleClose}
      />
    );
  }

  return { loadContent: guardedLoadContent, ContentGuard: ContentGuardHost };
}
