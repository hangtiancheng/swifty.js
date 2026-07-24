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

import { useEffect, useRef, useState } from "preact/hooks";
import { render } from "preact";
import { CheckIcon, CopyIcon } from "./icons";
import type { PageHeading } from "./lib/content";
import { cn } from "./lib/utils";
import { Toc } from "./toc";

interface ContentRendererProps {
  html: string;
  headings: PageHeading[];
}

export function ContentRenderer({ html, headings }: ContentRendererProps) {
  const articleRef = useRef<HTMLElement>(null);
  const disposersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    for (const dispose of disposersRef.current.splice(0)) dispose();

    // Security: `html` is the build-time output of this package's own
    // compileMarkdown() pipeline over first-party .md sources — it never
    // contains runtime user input.
    el.innerHTML = html;

    el.classList.remove("animate-page-in");
    void el.offsetWidth;
    el.classList.add("animate-page-in");

    for (const holder of Array.from(
      el.querySelectorAll<HTMLElement>("[data-swifty-toc]"),
    )) {
      render(<Toc headings={headings} inline />, holder);
      disposersRef.current.push(() => render(null, holder));
    }

    for (const block of Array.from(
      el.querySelectorAll<HTMLElement>(".codeblock"),
    )) {
      const pre = block.querySelector("pre");
      const holderEl = document.createElement("div");
      holderEl.className = "codeblock-actions";
      block.appendChild(holderEl);
      render(<CopyButton target={pre ?? block} />, holderEl);
      disposersRef.current.push(() => render(null, holderEl));
    }
  }, [html, headings]);

  useEffect(() => {
    return () => {
      for (const dispose of disposersRef.current.splice(0)) dispose();
    };
  }, []);

  const onClick = (e: MouseEvent) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    // In-page hash links get smooth scrolling; all other same-origin links
    // are intercepted globally by preact-iso's LocationProvider.
    if (href.startsWith("#")) {
      e.preventDefault();
      document
        .getElementById(href.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <article ref={articleRef} onClick={onClick} class="prose max-w-none" />
  );
}

function CopyButton({ target }: { target: HTMLElement }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(target.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <button
      onClick={() => void copy()}
      aria-label={copied ? "Copied" : "Copy code to clipboard"}
      class={cn("codeblock-copy", copied && "codeblock-copy-done")}
    >
      {copied ? <CheckIcon class="size-3.5" /> : <CopyIcon class="size-3.5" />}
    </button>
  );
}
