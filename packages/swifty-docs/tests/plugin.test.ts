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

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Plugin } from "vite";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { decryptContent } from "../src/client/crypto";
import { privateDocsPlugin } from "../src/node/plugin";
import type { EncryptedPayload } from "../src/shared/payload";

const SECRET_MD = `---
private: true
description: leaky description
---

# Secret page

Marker: TOP-SECRET-TOKEN-XYZ.

## Launch codes

Body text.
`;

const PUBLIC_MD = `# Public page

Hello.
`;

let srcDir: string;
let secretPath: string;
let publicPath: string;

beforeAll(() => {
  srcDir = mkdtempSync(join(tmpdir(), "vpd-test-"));
  secretPath = join(srcDir, "secret.md");
  publicPath = join(srcDir, "public.md");
  writeFileSync(secretPath, SECRET_MD);
  writeFileSync(publicPath, PUBLIC_MD);
});

afterAll(() => {
  rmSync(srcDir, { recursive: true, force: true });
});

afterEach(() => {
  delete process.env["DOCS_PASSWORD"];
  vi.restoreAllMocks();
});

function fakeSiteConfig() {
  return {
    srcDir,
    markdown: {},
    site: { base: "/" },
    logger: { warn: () => {} },
    cleanUrls: false,
  };
}

function createPlugin(options?: Parameters<typeof privateDocsPlugin>[0]) {
  const plugin = privateDocsPlugin(options);
  (plugin.configResolved as (config: unknown) => void)({
    vitepress: fakeSiteConfig(),
  });
  return plugin;
}

async function runTransform(
  plugin: Plugin,
  code: string,
  id: string,
): Promise<{ code: string } | null> {
  const transform = plugin.transform as unknown as (
    code: string,
    id: string,
  ) => Promise<{ code: string } | null>;
  return transform(code, id);
}

function compiledModuleFor(pageData: Record<string, unknown>): string {
  return [
    'import { defineComponent } from "vue";',
    `export const __pageData = JSON.parse(${JSON.stringify(JSON.stringify(pageData))});`,
    'const _sfc_main = { name: "compiled" };',
    "export default _sfc_main;",
  ].join("\n");
}

const secretPageData = {
  title: "Secret page",
  description: "leaky description",
  frontmatter: { private: true, description: "leaky description" },
  headers: [{ level: 2, title: "Launch codes", slug: "launch-codes" }],
  relativePath: "secret.md",
  filePath: "secret.md",
};

function extractPayload(stub: string): EncryptedPayload {
  const match = stub.match(/const __vpdPayload = (\{.*?\});/s);
  expect(match).not.toBeNull();
  return JSON.parse(match![1]!) as EncryptedPayload;
}

describe("privateDocsPlugin transform", () => {
  it("replaces a private page with an encrypted stub", async () => {
    process.env["DOCS_PASSWORD"] = "hunter2";
    const plugin = createPlugin();
    const result = await runTransform(plugin, compiledModuleFor(secretPageData), secretPath);

    expect(result).not.toBeNull();
    const stub = result!.code;

    // No plaintext content, headings, or description may remain.
    expect(stub).not.toContain("TOP-SECRET-TOKEN-XYZ");
    expect(stub).not.toContain("Launch codes");
    expect(stub).not.toContain("leaky description");

    // Scrubbed pageData keeps the title.
    expect(stub).toContain("Secret page");
    expect(stub).toContain('\\"headers\\":[]');

    // Stub wiring.
    expect(stub).toContain('h("vpd-private-page"');
    expect(stub).toContain('"data-key"');
    expect(stub).toContain("@swifty.js/docs/client");
    expect(stub).toContain("registerPrivatePage");

    // The payload decrypts back to the rendered markdown.
    const payload = extractPayload(stub);
    const envelope = JSON.parse(await decryptContent(payload, "hunter2")) as { html: string };
    expect(envelope.html).toContain("TOP-SECRET-TOKEN-XYZ");
    expect(envelope.html).toContain('id="launch-codes"');
  });

  it("synthesizes pageData when the compiled module has none", async () => {
    process.env["DOCS_PASSWORD"] = "hunter2";
    const plugin = createPlugin();
    const result = await runTransform(plugin, "export default {};", secretPath);
    expect(result).not.toBeNull();
    expect(result!.code).toContain("Secret page");
    expect(result!.code).not.toContain("TOP-SECRET-TOKEN-XYZ");
  });

  it("honors a custom clientModule", async () => {
    process.env["DOCS_PASSWORD"] = "hunter2";
    const plugin = createPlugin({ clientModule: "/src/client/index.ts" });
    const result = await runTransform(plugin, compiledModuleFor(secretPageData), secretPath);
    expect(result!.code).toContain('"/src/client/index.ts"');
  });

  it("leaves public pages untouched", async () => {
    process.env["DOCS_PASSWORD"] = "hunter2";
    const plugin = createPlugin();
    const result = await runTransform(plugin, compiledModuleFor({ title: "Public" }), publicPath);
    expect(result).toBeNull();
  });

  it("skips asset-style and plugin-vue sub-requests", async () => {
    process.env["DOCS_PASSWORD"] = "hunter2";
    const plugin = createPlugin();
    for (const query of ["?raw", "?url", "?vue&type=style&index=0"]) {
      expect(await runTransform(plugin, "code", `${secretPath}${query}`)).toBeNull();
    }
  });

  it("warns and publishes plaintext when DOCS_PASSWORD is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const plugin = createPlugin();
    const result = await runTransform(plugin, compiledModuleFor(secretPageData), secretPath);
    expect(result).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]![0]).toContain("UNENCRYPTED");

    // Warns only once per file.
    await runTransform(plugin, compiledModuleFor(secretPageData), secretPath);
    expect(warn).toHaveBeenCalledOnce();
  });
});
