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
 * IntersectionObserver scroll-spy over the heading elements of the current
 * page. The last heading whose top sits at or above `offset` (navbar
 * height + breathing room) is considered active.
 */
export function useScrollSpy(headings: PageHeading[], offset = 96): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    setActive("");
    if (headings.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      () => {
        let current = "";
        for (const h of headings) {
          const el = document.getElementById(h.slug);
          if (el && el.getBoundingClientRect().top <= offset) {
            current = h.slug;
          }
        }
        setActive(current);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    queueMicrotask(() => {
      for (const h of headings) {
        const el = document.getElementById(h.slug);
        if (el) observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings, offset]);

  return active;
}
