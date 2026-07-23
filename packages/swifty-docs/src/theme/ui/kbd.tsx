import Preact from "preact";
import { cn } from "../lib/utils";

export function Kbd({
  class: className,
  ...rest
}: Preact.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      class={cn(
        "border-border bg-muted/60 text-muted-foreground pointer-events-none inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px] font-medium select-none",
        className,
      )}
      {...rest}
    />
  );
}
