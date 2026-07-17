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

import { Peer, PeerPicker } from "./peers.js";
import { ConHashMap } from "./consistent-hash.js";
import { Client } from "./client.js";
import { ServiceDiscovery } from "./register.js";

const DEFAULT_SVC_NAME = "swifty_cache";

export interface PickerOption {
  serviceName?: string;
}

export class ClientPicker implements PeerPicker {
  private selfAddr: string;
  private svcName: string;
  private consHash: ConHashMap;
  private clients: Map<string, Client> = new Map();
  private discovery: ServiceDiscovery;

  constructor(addr: string, opts?: PickerOption) {
    this.selfAddr = addr;
    this.svcName = opts?.serviceName || DEFAULT_SVC_NAME;
    this.consHash = new ConHashMap();

    this.discovery = new ServiceDiscovery(
      this.svcName,
      (peerAddr) => this.onPeerDiscovered(peerAddr),
      (peerAddr) => this.onPeerRemoved(peerAddr),
    );
  }

  async start(): Promise<void> {
    const addrs = await this.discovery.fetchAll();
    for (const addr of addrs) {
      if (addr && addr !== this.selfAddr) {
        this.addPeer(addr);
      }
    }
    await this.discovery.watch();
  }

  pickPeer(key: string): [Peer | null, boolean, boolean] {
    const addr = this.consHash.get(key);
    if (!addr) return [null, false, false];
    if (addr === this.selfAddr) return [null, true, true];
    const client = this.clients.get(addr);
    if (client) return [client, true, false];
    return [null, false, false];
  }

  async close(): Promise<void> {
    this.consHash.close();
    for (const client of this.clients.values()) {
      await client.close();
    }
    this.clients.clear();
    await this.discovery.close();
  }

  printPeers(): void {
    console.log("[SwiftyCache] Discovered peers:");
    for (const addr of this.clients.keys()) {
      console.log(`  - ${addr}`);
    }
  }

  private onPeerDiscovered(addr: string): void {
    if (addr === this.selfAddr) return;
    if (this.clients.has(addr)) return;
    this.addPeer(addr);
    console.log(`[SwiftyCache] New service discovered at ${addr}`);
  }

  private onPeerRemoved(addr: string): void {
    if (addr === this.selfAddr) return;
    const client = this.clients.get(addr);
    if (client) {
      client.close();
      this.clients.delete(addr);
      this.consHash.remove(addr);
      console.log(`[SwiftyCache] Service removed at ${addr}`);
    }
  }

  private addPeer(addr: string): void {
    const client = new Client(addr);
    this.consHash.add(addr);
    this.clients.set(addr, client);
    console.log(`[SwiftyCache] Successfully created client for ${addr}`);
  }
}
