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

import { useEffect, useState } from "react";
import { useDocs } from "./context";
import { ArrowUpRightIcon, MenuIcon, SearchIcon } from "lucide-react";
import { cn } from "./lib/utils";
import type { NavItem } from "@/types";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Kbd } from "./ui/kbd";

interface NavbarProps {
  path: string;
  landing: string;
  onMenuClick: () => void;
}

export function Navbar({ path, landing, onMenuClick }: NavbarProps) {
  const docs = useDocs();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-muted/80 bg-background/80 border-b shadow-[0_1px_12px_-6px_rgb(0_0_0/0.08)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-360 items-center gap-2 px-4 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <MenuIcon className="size-4.5" />
        </Button>

        <Logo href={landing} title={docs.config.title} />

        <nav
          className="ml-4 hidden items-center gap-0.5 md:flex"
          aria-label="Primary"
        >
          {(docs.config.nav ?? []).map((item, i) => (
            <NavMenuItem key={`${i}:${item.link}`} item={item} path={path} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {docs.searchEnabled ? (
            <>
              <button
                onClick={docs.toggleSearch}
                aria-label="Search documentation"
                className="group border-muted/80 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-accent/60 focus-visible:ring-primary/50 hidden h-8 w-52 items-center gap-2 rounded-md border px-2.5 text-left text-xs transition-[border-color,background-color,width] duration-300 focus-visible:ring-2 focus-visible:outline-none sm:flex lg:w-60"
              >
                <SearchIcon className="size-3.5 shrink-0 opacity-70 transition-transform duration-300 group-hover:scale-110" />
                <span className="flex-1 truncate">Search documentation…</span>
                <Kbd>⌘K</Kbd>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={docs.toggleSearch}
                aria-label="Search documentation"
              >
                <SearchIcon className="size-4.5" />
              </Button>
            </>
          ) : (
            <span className="hidden sm:block" />
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function NavMenuItem({ item, path }: { item: NavItem; path: string }) {
  const external = /^https?:\/\//.test(item.link);
  const target = item.link.replace(/\/+$/, "") || "/";
  const active =
    !external && (path === target || path.startsWith(target + "/"));

  const classes = cn(
    "relative flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors duration-200",
    "after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.32,0.72,0,1)]",
    active
      ? "font-medium text-foreground after:scale-x-100"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:after:scale-x-100",
  );

  if (external) {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {item.text}
        <ArrowUpRightIcon className="size-3 opacity-60" />
      </a>
    );
  }

  return (
    <a href={item.link} className={classes}>
      {item.text}
    </a>
  );
}
