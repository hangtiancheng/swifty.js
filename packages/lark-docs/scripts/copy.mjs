/**
 * Post-build script: copies .d.ts → .d.cts for CJS consumers,
 * and copies static assets (file-content.ejs, shims.d.ts)
 * into dist/ so they are available to consumers at runtime.
 *
 * Vite 7's build.lib does not natively emit .d.cts files,
 * but our package.json exports map requires both .d.ts and .d.cts
 * for dual-format (ESM + CJS) type support.
 *
 * Recursively walks dist/ to handle subdirectories (e.g. dist/theme/).
 */
import { readdirSync, copyFileSync, statSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";

const pkgRoot = resolve(import.meta.dirname, "..");
const distDir = resolve(pkgRoot, "dist");
const srcDir = resolve(pkgRoot, "src");

// --- Step 1: copy .d.ts → .d.cts ---

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

// --- Step 2: copy static assets from src/ to dist/ ---

const STATIC_ASSETS = ["file-content.ejs", "client.d.ts", "client.css"];

for (const file of STATIC_ASSETS) {
  const src = resolve(srcDir, file);
  const dest = resolve(distDir, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`  ${file} → dist/${file}`);
  }
}

console.log("\nStatic assets copied to dist/");
