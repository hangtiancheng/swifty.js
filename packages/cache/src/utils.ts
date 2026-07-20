/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { networkInterfaces } from "os";

const HOSTNAME_RE =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validPort(port: string): boolean {
  if (!/^\d{1,5}$/.test(port)) return false;
  const n = Number(port);
  return n >= 1 && n <= 65535;
}

function validIPv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

export function validPeerAddr(addr: string): boolean {
  // [IPv6]:port
  const v6 = addr.match(/^\[([0-9a-fA-F:.]+)\]:(\d+)$/);
  if (v6) {
    return v6[1].includes(":") && validPort(v6[2]);
  }

  const idx = addr.lastIndexOf(":");
  if (idx <= 0 || idx === addr.length - 1) return false;
  const host = addr.slice(0, idx);
  const port = addr.slice(idx + 1);
  if (!validPort(port)) return false;

  if (host === "localhost") return true;
  if (host.includes(".")) {
    // dotted form must be a valid IPv4 or a valid multi-label hostname
    return validIPv4(host) || HOSTNAME_RE.test(host);
  }
  return false;
}

export function getLocalIP(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  throw new Error("no valid local IP found");
}
