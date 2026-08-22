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

import __react__, { useMemo, useState } from "./diff/index.ts";
import ResumeHeader from "./components/ResumeHeader.tsx";
import SectionEdu from "./components/SectionEdu.tsx";
import SectionList from "./components/SectionList.tsx";
import { buildSections, resumeOf } from "./i18n/index.ts";
import type { Lang } from "./i18n/index.ts";

/**
 * Root component. Owns the language state and passes resume content down
 * as props — toggling the locale re-renders the tree and the diff patches
 * only the text that changed.
 */
export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const data = resumeOf(lang);
  const sections = useMemo(() => buildSections(data), [data]);

  const toggleLocale = () => {
    setLang((current: Lang) => (current === "en" ? "zh" : "en"));
  };

  return (
    <div className="min-h-dvh w-full bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-1.5">
        <ResumeHeader
          name={data.name}
          about={data.about}
          tel={data.tel}
          email={data.email}
          github={data.github}
          labels={data.labels}
          onToggleLocale={toggleLocale}
        />

        <SectionEdu header={data.headers.edu} edu={data.edu} />

        {sections.map((section, index) => (
          <div key={String(index)} id={`section-${index}`}>
            <SectionList title={section.title} items={section.items} />
          </div>
        ))}
      </div>
    </div>
  );
}
