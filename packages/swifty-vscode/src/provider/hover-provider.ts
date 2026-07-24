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

import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs";

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".bmp",
  ".ico",
]);

const IMAGE_PATH_REGEX = /['"]([^'"]*\.(png|jpe?g|gif|svg|webp|bmp|ico))['"]/i;

export class ImageHoverProvider implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const range = document.getWordRangeAtPosition(position, IMAGE_PATH_REGEX);
    if (range === undefined) {
      return null;
    }

    const text = document.getText(range);
    const match = IMAGE_PATH_REGEX.exec(text);
    if (match === null || match[1] === undefined) {
      return null;
    }

    const imagePath = match[1];

    // Handle absolute URLs
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      const markdown = new vscode.MarkdownString(`![preview](${imagePath}|width=200)`);
      markdown.supportHtml = true;
      return new vscode.Hover(markdown, range);
    }

    // Handle relative paths
    const documentDir = path.dirname(document.fileName);
    const resolvedPath = path.resolve(documentDir, imagePath);

    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      return null;
    }

    const fileUri = vscode.Uri.file(resolvedPath);
    const markdown = new vscode.MarkdownString(`![preview](${fileUri.toString()}|width=200)`);
    markdown.supportHtml = true;

    return new vscode.Hover(markdown, range);
  }
}
