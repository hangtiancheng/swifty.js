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

import __react__, { useState } from "../diff/index.ts";
import type { Labels } from "../schema/resume.ts";
import avatarUrl from "../assets/avatar.jpeg";

interface ResumeHeaderProps {
  name: string;
  about: string;
  tel: string;
  email: string;
  github: string;
  labels: Labels;
  onToggleLocale: () => void;
}

interface ContactChipProps {
  label: string;
  href: string;
  text: string;
  external?: boolean;
}

function ContactChip({ label, href, text, external }: ContactChipProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
        {label}
      </span>
      <a
        href={href}
        className="text-neutral-900 hover:text-black hover:underline"
        target={external ? "_blank" : null}
        rel={external ? "noopener" : null}
      >
        {text}
      </a>
    </div>
  );
}

/**
 * Resume header. Pure presentation — data arrives via props, and the
 * language toggle calls back into the parent (the React equivalent of the
 * lark-mvc "toggleLocale" frame event). The avatar preview overlay is
 * local state.
 */
export default function ResumeHeader({
  name,
  about,
  tel,
  email,
  github,
  labels,
  onToggleLocale,
}: ResumeHeaderProps) {
  const [previewing, setPreviewing] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
        <img
          src={avatarUrl}
          alt={name}
          className="size-16 shrink-0 cursor-zoom-in rounded-md border border-neutral-200 object-cover"
          fetchpriority="low"
          onClick={() => setPreviewing(true)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-neutral-900">{name}</h1>
            <button
              className="rounded-md border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              onClick={onToggleLocale}
            >
              {labels.switch}
            </button>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{about}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <ContactChip label={labels.tel} href={`tel:${tel}`} text={tel} />
            <ContactChip
              label={labels.email}
              href={`mailto:${email}`}
              text={email}
            />
            <ContactChip
              label={labels.github}
              href={`https://github.com/${github}`}
              text={`https://github.com/${github}`}
              external
            />
          </div>
        </div>
      </div>

      {previewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewing(false)}
        >
          <img
            src={avatarUrl}
            alt={name}
            className="max-h-[80vh] max-w-[80vw] rounded-lg shadow-2xl"
            onClick={(event: Event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
