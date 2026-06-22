/**
 * Copy .d.ts files to .d.cts for CJS consumers.
 *
 * Vite 7's build.lib does not natively emit .d.cts files,
 * but our package.json exports map requires both .d.ts and .d.cts
 * for dual-format (ESM + CJS) type support.
 *
 * This script simply copies each .d.ts to its .d.cts counterpart.
 */
import { readdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve(import.meta.dirname, "../dist");

const dtsFiles = readdirSync(distDir).filter(
  (f) => f.endsWith(".d.ts") && !/-[A-Z0-9]{6,}\./i.test(f),
);

for (const file of dtsFiles) {
  const src = resolve(distDir, file);
  const dest = resolve(distDir, file.replace(/\.d\.ts$/, ".d.cts"));
  copyFileSync(src, dest);
  console.log(`  ${file} → ${file.replace(/\.d\.ts$/, ".d.cts")}`);
}

console.log(`\nCopied ${dtsFiles.length} .d.ts → .d.cts`);
