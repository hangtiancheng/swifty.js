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

type MermaidApi = typeof import("mermaid").default;

// Lazy singleton — pages without diagrams never pay for mermaid (same idiom
// as the Shiki loader in markdown/highlighter.ts).
let mermaidPromise: Promise<MermaidApi> | null = null;

function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default);
  }
  return mermaidPromise;
}

// Rendered SVG cache: `${theme}\u0000${code}` -> svg. Theme toggles and
// re-mounts (navigation back, md hot reload) hit this instead of a full
// mermaid.render.
const svgCache = new Map<string, string>();

let renderSeq = 0;
// Serializes renders — mermaid.initialize is global state, so two diagrams
// initialized with different themes must never interleave. Each queued task
// re-reads the current theme so a toggle during a long render wins.
let queue: Promise<unknown> = Promise.resolve();

function currentTheme(): "dark" | "default" {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "default";
}

function renderMermaid(code: string): Promise<string> {
  const task = queue.then(async () => {
    const theme = currentTheme();
    const cacheKey = `${theme}\u0000${code}`;
    const cached = svgCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const mermaid = await loadMermaid();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      suppressErrorRendering: true,
      theme,
    });
    const { svg } = await mermaid.render(`swifty-mermaid-${renderSeq++}`, code);
    svgCache.set(cacheKey, svg);
    return svg;
  });
  // Keep the queue alive after failures; the caller still sees the rejection.
  queue = task.catch(() => {});
  return task;
}

export interface MermaidDiagramProps {
  /** Decoded mermaid source. */
  code: string;
}

/**
 * Renders a mermaid diagram from first-party markdown source. Re-renders
 * with the matching mermaid theme when `.dark` on <html> toggles (the
 * repo-wide dark-mode source of truth, observed like theme-toggle does).
 */
export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // `dark` is only the trigger — the effective theme is re-read inside the
  // serialized render task, so rapid toggles cannot mismatch.
  useEffect(() => {
    let cancelled = false;
    renderMermaid(code)
      .then((rendered) => {
        if (cancelled) return;
        setSvg(rendered);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.warn("[@swifty.js/docs] mermaid render failed:", err);
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [code, dark]);

  if (error !== null) {
    return (
      <pre className="mermaid-error">
        <code>{`${error}\n\n${code}`}</code>
      </pre>
    );
  }

  // Security: the SVG is mermaid's output over build-time first-party
  // markdown — same trust model as ContentRenderer's innerHTML.
  return (
    <div
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
