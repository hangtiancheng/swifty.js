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
import { registerOpenInGithubCommand } from "./command/open-in-github-command.js";
import { ImageHoverProvider } from "./provider/hover-provider.js";
import { StatusBarManager } from "./status-bar/status-bar-manager.js";
import { initLogger, log } from "./logger.js";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const outputChannel = initLogger();
  context.subscriptions.push(outputChannel);

  log("Extension activating");

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    log("No workspace folders found, skipping activation");
    return;
  }

  const firstFolder = workspaceFolders[0];
  if (firstFolder === undefined) {
    return;
  }
  const workspaceRoot = firstFolder.uri.fsPath;

  context.subscriptions.push(vscode.languages.registerHoverProvider("*", new ImageHoverProvider()));

  registerOpenInGithubCommand(context, workspaceRoot);

  const statusBarManager = new StatusBarManager(context);
  statusBarManager.initialize();

  log("Extension activated successfully");
}

export function deactivate(): void {}
