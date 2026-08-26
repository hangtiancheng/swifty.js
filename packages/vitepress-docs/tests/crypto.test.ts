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

import { describe, expect, it } from "vitest";
import { decryptContent } from "../src/client/crypto";
import { encryptContent } from "../src/node/encrypt";

describe("encrypt/decrypt roundtrip", () => {
  it("decrypts what the build encrypted", async () => {
    const plaintext = JSON.stringify({ html: "<h1>秘密 secret</h1>" });
    const payload = encryptContent(plaintext, "correct horse");
    expect(await decryptContent(payload, "correct horse")).toBe(plaintext);
  });

  it("produces fresh salt and iv per call", () => {
    const a = encryptContent("same", "pwd");
    const b = encryptContent("same", "pwd");
    expect(a.salt).not.toBe(b.salt);
    expect(a.iv).not.toBe(b.iv);
    expect(a.encrypted).not.toBe(b.encrypted);
  });

  it("rejects a wrong password (GCM auth failure)", async () => {
    const payload = encryptContent("top secret", "right");
    await expect(decryptContent(payload, "wrong")).rejects.toThrow();
  });

  it("rejects a tampered ciphertext", async () => {
    const payload = encryptContent("top secret", "pwd");
    const bytes = Buffer.from(payload.encrypted, "base64");
    if (bytes.length > 0) bytes[0] = bytes[0]! ^ 0xff;
    const tampered = { ...payload, encrypted: bytes.toString("base64") };
    await expect(decryptContent(tampered, "pwd")).rejects.toThrow();
  });
});
