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

import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import type { NavLink } from "./lib/content";

interface PrevNextProps {
  prev: NavLink | null;
  next: NavLink | null;
}

export function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav
      class="border-border/70 mt-14 grid gap-3 border-t pt-6 sm:grid-cols-2"
      aria-label="Page navigation"
    >
      {prev && (
        <a
          href={prev.link}
          class="group border-border/80 bg-card/60 hover:border-primary/40 hover:bg-accent/40 flex items-center gap-3 rounded-xl border px-4 py-3 transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-sm"
        >
          <ArrowLeftIcon class="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-[transform,color] duration-300 group-hover:-translate-x-0.5" />
          <span class="min-w-0">
            <span class="text-muted-foreground block font-mono text-[10px] font-medium tracking-[0.14em] uppercase">
              Previous
            </span>
            <span class="text-foreground block truncate text-sm font-medium">
              {prev.text}
            </span>
          </span>
        </a>
      )}
      {next && (
        <a
          href={next.link}
          class="group border-border/80 bg-card/60 hover:border-primary/40 hover:bg-accent/40 flex flex-row-reverse items-center gap-3 rounded-xl border px-4 py-3 text-right transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-sm sm:col-start-2"
        >
          <ArrowRightIcon class="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-[transform,color] duration-300 group-hover:translate-x-0.5" />
          <span class="min-w-0">
            <span class="text-muted-foreground block font-mono text-[10px] font-medium tracking-[0.14em] uppercase">
              Next
            </span>
            <span class="text-foreground block truncate text-sm font-medium">
              {next.text}
            </span>
          </span>
        </a>
      )}
    </nav>
  );
}
