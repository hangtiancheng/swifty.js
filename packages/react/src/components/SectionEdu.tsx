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

import __react__ from "../diff/index.ts";

interface SectionEduProps {
  header: string;
  edu: string[][];
}

/** Education section: one grid row per school. */
export default function SectionEdu({ header, edu }: SectionEduProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-3">
      <div className="text-sm font-semibold text-neutral-900">{header}</div>
      <div className="my-1 h-px bg-neutral-100"></div>
      <ul className="mt-1.5 space-y-0.5 text-xs">
        {edu.map((row, index) => (
          <li key={String(index)} className="grid gap-1 md:grid-cols-3">
            <div className="text-neutral-700">{row[0]}</div>
            <div className="text-neutral-700">{row[1]}</div>
            <div className="text-neutral-700">{row[2]}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
