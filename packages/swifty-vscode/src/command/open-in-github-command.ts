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
import { exec } from "node:child_process";

let cachedRemoteUrl: string | null = null;

export function registerOpenInGithubCommand(
  context: vscode.ExtensionContext,
  rootPath: string,
): void {
  const command = vscode.commands.registerCommand("swifty.openInGithub", (uri?: vscode.Uri) => {
    void handleOpenInGithub(rootPath, uri);
  });

  context.subscriptions.push(command);
}

async function handleOpenInGithub(rootPath: string, uri?: vscode.Uri): Promise<void> {
  const filePath = uri?.fsPath ?? vscode.window.activeTextEditor?.document.fileName;
  if (filePath === undefined) {
    return;
  }

  try {
    const repoUrl = await getRepositoryUrl(rootPath);
    const branch = await getCurrentBranch(rootPath);
    const relativePath = path.relative(rootPath, filePath);
    const isDir = filePath.endsWith(path.sep);
    const type = isDir ? "tree" : "blob";
    const url = `${repoUrl}/${type}/${branch}/${relativePath}`;
    void vscode.env.openExternal(vscode.Uri.parse(url));
  } catch (e: unknown) {
    cachedRemoteUrl = null;
    const message = e instanceof Error ? e.message : "Unknown error";
    void vscode.window.showErrorMessage(`Failed to open in GitHub: ${message}`);
  }
}

function execAsync(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, encoding: "utf-8", timeout: 5000 }, (error, stdout) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function getCurrentBranch(rootPath: string): Promise<string> {
  const output = await execAsync("git rev-parse --abbrev-ref HEAD", rootPath);
  if (output.length === 0) {
    throw new Error("Could not determine current git branch");
  }
  return output;
}

async function getRepositoryUrl(rootPath: string): Promise<string> {
  if (cachedRemoteUrl !== null) {
    return cachedRemoteUrl;
  }
  const output = await execAsync("git remote get-url origin", rootPath);
  if (output.length === 0) {
    throw new Error("Could not determine git remote URL");
  }
  cachedRemoteUrl = normalizeGitUrl(output);
  return cachedRemoteUrl;
}

function normalizeGitUrl(raw: string): string {
  // SSH format: git@github.com:user/repo.git
  const sshMatch = raw.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (sshMatch?.[1] !== undefined && sshMatch[2] !== undefined) {
    return `https://${sshMatch[1]}/${sshMatch[2]}`;
  }

  // HTTPS format: https://github.com/user/repo.git
  const httpsMatch = raw.match(/^(https?:\/\/.+?)(?:\.git)?$/);
  if (httpsMatch?.[1] !== undefined) {
    return httpsMatch[1];
  }

  throw new Error(`Unrecognized git remote format: ${raw}`);
}
