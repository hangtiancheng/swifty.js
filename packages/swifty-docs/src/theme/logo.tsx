import { FeatherIcon, MoonIcon, SunIcon } from "lucide-preact";
import { cn } from "./lib/utils";

interface LogoProps {
  href: string;
  title: string;
  class?: string;
}

export function Logo({ href, title, class: className }: LogoProps) {
  return (
    <a
      href={href}
      class={cn(
        "group focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      aria-label={`${title} — home`}
    >
      <span class="from-primary to-primary/70 text-primary-foreground shadow-primary/30 grid size-8 place-items-center rounded-lg bg-linear-to-br shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-hover:-rotate-6">
        <FeatherIcon class="size-4.5" stroke-width={2.4} />
      </span>
      <span class="flex items-baseline gap-2">
        <span class="font-display text-foreground text-lg font-semibold tracking-tight">
          {title}
        </span>
        <span class="border-primary/25 bg-primary/8 text-primary hidden rounded border px-1.5 py-px font-mono text-[10px] font-medium tracking-widest sm:inline-block">
          DOCS
        </span>
      </span>
    </a>
  );
}

export function ThemeToggleIcon({
  dark,
  class: className,
}: {
  dark: boolean;
  class?: string;
}) {
  return (
    <span class={cn("relative block size-4", className)} aria-hidden="true">
      <MoonIcon
        class={cn(
          "absolute inset-0 size-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          dark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <SunIcon
        class={cn(
          "absolute inset-0 size-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          dark
            ? "scale-50 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
    </span>
  );
}
