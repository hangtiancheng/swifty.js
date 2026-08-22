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

import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { PageHeading } from "./lib/content";
import { cn, decodedLocationHash } from "./lib/utils";
import { MermaidDiagram } from "./mermaid";
import { Toc } from "./toc";

interface ContentRendererProps {
  html: string;
  headings: PageHeading[];
  /** Identity of the rendered page; when unchanged, the page-in animation is not replayed. */
  pageKey?: string;
}

export function ContentRenderer({
  html,
  headings,
  pageKey,
}: ContentRendererProps) {
  const articleRef = useRef<HTMLElement>(null);
  const disposersRef = useRef<Array<() => void>>([]);
  const lastKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    for (const dispose of disposersRef.current.splice(0)) dispose();

    // Security: `html` is the build-time output of this package's own
    // compileMarkdown() pipeline over first-party .md sources — it never
    // contains runtime user input.
    el.innerHTML = html;

    if (pageKey === undefined || lastKeyRef.current !== pageKey) {
      lastKeyRef.current = pageKey;
      el.classList.remove("animate-page-in");
      void el.offsetWidth;
      el.classList.add("animate-page-in");
    }

    for (const holder of Array.from(
      el.querySelectorAll<HTMLElement>("[swifty-docs-toc]"),
    )) {
      const root = createRoot(holder);
      root.render(<Toc headings={headings} inline />);
      disposersRef.current.push(() => root.unmount());
    }

    for (const holder of Array.from(
      el.querySelectorAll<HTMLElement>(".mermaid-block[data-mermaid]"),
    )) {
      const code = decodeURIComponent(holder.dataset["mermaid"] ?? "");
      const root = createRoot(holder);
      root.render(<MermaidDiagram code={code} />);
      disposersRef.current.push(() => root.unmount());
    }

    for (const block of Array.from(
      el.querySelectorAll<HTMLElement>(".codeblock"),
    )) {
      const pre = block.querySelector("pre");
      const holderEl = document.createElement("div");
      holderEl.className = "codeblock-actions";
      block.appendChild(holderEl);
      const root = createRoot(holderEl);
      root.render(<CopyButton target={pre ?? block} />);
      disposersRef.current.push(() => root.unmount());
    }
  }, [html, headings, pageKey]);

  useEffect(() => {
    return () => {
      for (const dispose of disposersRef.current.splice(0)) dispose();
    };
  }, []);

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    // In-page hash links get smooth scrolling; all other same-origin links
    // are intercepted globally by the LocationProvider's click handler.
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      // pushState records a copyable deep link and a back-button entry
      // without triggering the router or the browser's instant jump.
      // Skip when the hash is already current to avoid duplicate entries
      // (decoded comparison — location.hash is percent-encoded for CJK slugs).
      if (decodedLocationHash() !== href) {
        history.pushState(null, "", href);
      }
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <article ref={articleRef} onClick={onClick} className="prose max-w-none" />
  );
}

function CopyButton({ target }: { target: HTMLElement }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(target.innerText);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <button
      onClick={() => void copy()}
      aria-label={copied ? "Copied" : "Copy code to clipboard"}
      className={cn("codeblock-copy", copied && "codeblock-copy-done")}
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </button>
  );
}
