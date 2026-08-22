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
import { ListIcon } from "lucide-react";
import type { PageHeading } from "./lib/content";
import { useScrollSpy } from "./lib/scroll-spy";
import { cn, decodedLocationHash } from "./lib/utils";

interface TocProps {
  headings: PageHeading[];
  inline?: boolean;
}

export function Toc({ headings, inline }: TocProps) {
  const active = useScrollSpy(headings);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [marker, setMarker] = useState({ top: 0, height: 0, show: false });

  useEffect(() => {
    const el = active ? linkRefs.current.get(active) : undefined;
    if (el && el.parentElement) {
      setMarker({
        top: el.parentElement.offsetTop,
        height: el.parentElement.offsetHeight,
        show: true,
      });
    } else {
      setMarker((m) => ({ ...m, show: false }));
    }
  }, [active]);

  const scrollTo =
    (slug: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const el = document.getElementById(slug);
      if (!el) return;
      // pushState (instead of setting location.hash) records a copyable deep
      // link and a back-button entry without triggering the router or the
      // browser's instant jump — the smooth scroll stays in control.
      // Skip when the hash is already current to avoid duplicate entries
      // (decoded comparison — location.hash is percent-encoded for CJK slugs).
      if (decodedLocationHash() !== `#${slug}`) {
        history.pushState(null, "", `#${slug}`);
      }
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

  if (headings.length === 0) return null;

  return (
    <div
      className={cn(
        inline &&
          "not-prose border-muted/80 bg-muted/30 my-6 rounded-xl border p-4",
      )}
    >
      <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">
        <ListIcon className="size-3.5" />
        On this page
      </p>
      <div className="relative mt-3">
        <span
          aria-hidden="true"
          className="bg-muted/80 absolute inset-y-0 left-0 w-px"
        />
        <span
          aria-hidden="true"
          className={cn(
            "bg-primary absolute left-0 w-px rounded-full transition-[top,height,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            !marker.show && "opacity-0",
          )}
          style={{ top: `${marker.top}px`, height: `${marker.height}px` }}
        />
        <ul className="space-y-px pl-3">
          {headings.map((h) => (
            <li key={h.slug} className="relative">
              <a
                ref={(el) => {
                  if (el) linkRefs.current.set(h.slug, el);
                  else linkRefs.current.delete(h.slug);
                }}
                href={`#${h.slug}`}
                onClick={scrollTo(h.slug)}
                className={cn(
                  "block py-1 text-xs leading-snug transition-colors duration-200",
                  h.level >= 3 && "pl-3",
                  active === h.slug
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
