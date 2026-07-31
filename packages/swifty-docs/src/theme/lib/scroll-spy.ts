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

import { useEffect, useState } from "preact/hooks";
import type { PageHeading } from "./content";

/**
 * Scroll-spy over the heading elements of the current page. The last
 * heading whose top sits at or above `offset` (navbar height + breathing
 * room) is considered active; at the very bottom of the page the last
 * heading wins, since trailing sections may be too short to ever reach
 * the offset line.
 *
 * Recomputes on scroll/resize (rAF-throttled) rather than via
 * IntersectionObserver: IO only fires when a heading crosses its
 * rootMargin band edges, which rarely coincides with the `offset` line
 * the active state is judged against — the highlight went stale between
 * crossings.
 */
export function useScrollSpy(headings: PageHeading[], offset = 96): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    setActive("");
    if (headings.length === 0 || typeof window === "undefined") {
      return;
    }

    let raf = 0;
    const compute = () => {
      raf = 0;
      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 1;
      let current = "";
      if (atBottom) {
        for (let i = headings.length - 1; i >= 0; i--) {
          if (document.getElementById(headings[i].slug)) {
            current = headings[i].slug;
            break;
          }
        }
      } else {
        for (const h of headings) {
          const el = document.getElementById(h.slug);
          // +1 tolerates subpixel rounding after smooth scrollIntoView.
          if (el && el.getBoundingClientRect().top <= offset + 1) {
            current = h.slug;
          }
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    // First compute lands in the next frame, after the page content
    // (rendered in the same commit) is in the DOM.
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Late layout shifts (images, fonts, lazy code blocks) move the
    // headings without a scroll event — watch the document size too.
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : undefined;
    ro?.observe(document.documentElement);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
  }, [headings, offset]);

  return active;
}
