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
import { z } from "zod";

const ShortcutSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
});

const ShortcutListSchema = z.array(ShortcutSchema);

type Shortcut = z.infer<typeof ShortcutSchema>;

export class StatusBarManager {
  private readonly context: vscode.ExtensionContext;
  private readonly items: vscode.StatusBarItem[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  initialize(): void {
    this.refresh();

    // Listen for configuration changes
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("swifty.statusBar.shortcuts")) {
          this.refresh();
        }
      }),
    );
  }

  private refresh(): void {
    this.disposeItems();

    const config = vscode.workspace.getConfiguration("swifty");
    const raw: unknown = config.get("statusBar.shortcuts");

    const result = ShortcutListSchema.safeParse(raw);
    if (!result.success) {
      return;
    }

    for (const shortcut of result.data) {
      this.createStatusBarItem(shortcut);
    }
  }

  private createStatusBarItem(shortcut: Shortcut): void {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    item.text = `$(link-external) ${shortcut.name}`;
    item.tooltip = shortcut.url;
    item.command = {
      title: `Open ${shortcut.name}`,
      command: "vscode.open",
      arguments: [vscode.Uri.parse(shortcut.url)],
    };
    item.show();
    this.items.push(item);
  }

  private disposeItems(): void {
    for (const item of this.items) {
      item.dispose();
    }
    this.items.length = 0;
  }
}
