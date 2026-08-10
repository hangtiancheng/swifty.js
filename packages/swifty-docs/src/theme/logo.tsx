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

import {
  Clock1Icon,
  Clock2Icon,
  Clock3Icon,
  Clock4Icon,
  Clock5Icon,
  Clock6Icon,
  Clock7Icon,
  Clock8Icon,
  Clock9Icon,
  Clock10Icon,
  Clock11Icon,
  Clock12Icon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { cn } from "./lib/utils";

// Index = hour % 12, so 0 (and 12) maps to the 12 o'clock face.
const CLOCK_ICONS = [
  Clock12Icon,
  Clock1Icon,
  Clock2Icon,
  Clock3Icon,
  Clock4Icon,
  Clock5Icon,
  Clock6Icon,
  Clock7Icon,
  Clock8Icon,
  Clock9Icon,
  Clock10Icon,
  Clock11Icon,
];

interface LogoProps {
  href: string;
  title: string;
  className?: string;
}

export function Logo({ href, title, className }: LogoProps) {
  const ClockIcon = CLOCK_ICONS[new Date().getHours() % 12];
  return (
    <a
      href={href}
      className={cn(
        "group focus-visible:ring-primary/50 flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      aria-label={`${title} — home`}
    >
      <span className="text-primary grid size-7 place-items-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-12">
        <ClockIcon className="size-5" />
      </span>
      <span className="font-display text-foreground text-[0.95rem] font-semibold tracking-tight">
        {title}
      </span>
    </a>
  );
}

export function ThemeToggleIcon({ dark }: { dark: boolean }) {
  return (
    <span className="relative block size-4" aria-hidden="true">
      <MoonIcon
        className={cn(
          "absolute inset-0 size-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          dark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <SunIcon
        className={cn(
          "absolute inset-0 size-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          dark
            ? "scale-50 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
    </span>
  );
}
