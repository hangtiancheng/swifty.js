/**
 * Copy .d.ts files to .d.cts for CJS consumers.
 *
 * Vite 7's build.lib does not natively emit .d.cts files,
 * but our package.json exports map requires both .d.ts and .d.cts
 * for dual-format (ESM + CJS) type support.
 *
 * Recursively walks dist/ to handle subdirectories (e.g. dist/theme/).
 */
import { readdirSync, copyFileSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";

const distDir = resolve(import.meta.dirname, "../dist");

let count = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      walk(full);
    } else if (entry.endsWith(".d.ts") && !/-[A-Z0-9]{6,}\./i.test(entry)) {
      const dest = full.replace(/\.d\.ts$/, ".d.cts");
      copyFileSync(full, dest);
      console.log(`  ${relative(distDir, full)} → ${relative(distDir, dest)}`);
      count++;
    }
  }
}

walk(distDir);

console.log(`\nCopied ${count} .d.ts → .d.cts`);
