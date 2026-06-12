import { Etcd3, Lease, Watcher } from "etcd3";
import { getLocalIP } from "./utils.js";

export interface RegisterConfig {
  endpoints: string[];
  dialTimeout: number;
}

export const defaultRegisterConfig: RegisterConfig = {
  endpoints: ["localhost:2379"],
  dialTimeout: 5000,
};

export async function register(
  svcName: string,
  addr: string,
  stopSignal: AbortSignal,
): Promise<void> {
  const client = new Etcd3({ hosts: defaultRegisterConfig.endpoints });

  if (addr.startsWith(":")) {
    const localIP = getLocalIP();
    addr = `${localIP}${addr}`;
  }

  const lease = client.lease(10);
  const key = `/services/${svcName}/${addr}`;

  await lease.put(key).value(addr);

  lease.on("lost", () => {
    console.log("[LarkCache] lease lost");
  });

  stopSignal.addEventListener("abort", async () => {
    try {
      await lease.revoke();
      await client.delete().key(key);
    } catch {
      // ignore cleanup errors
    } finally {
      client.close();
    }
  });

  console.log(`[LarkCache] Service registered: ${svcName} at ${addr}`);
}

export class ServiceDiscovery {
  private client: Etcd3;
  private svcName: string;
  private watcher: Watcher | null = null;
  private onPut: (addr: string) => void;
  private onDelete: (addr: string) => void;

  constructor(svcName: string, onPut: (addr: string) => void, onDelete: (addr: string) => void) {
    this.client = new Etcd3({ hosts: defaultRegisterConfig.endpoints });
    this.svcName = svcName;
    this.onPut = onPut;
    this.onDelete = onDelete;
  }

  async fetchAll(): Promise<string[]> {
    const result = await this.client.getAll().prefix(`/services/${this.svcName}`);
    const addrs: string[] = [];
    for (const [, value] of Object.entries(result)) {
      const addr = value.toString();
      if (addr) addrs.push(addr);
    }
    return addrs;
  }

  async watch(): Promise<void> {
    this.watcher = await this.client.watch().prefix(`/services/${this.svcName}`).create();

    this.watcher.on("put", (kv) => {
      const addr = kv.value.toString();
      if (addr) this.onPut(addr);
    });

    this.watcher.on("delete", (kv) => {
      const addr = kv.value.toString();
      if (addr) this.onDelete(addr);
    });
  }

  async close(): Promise<void> {
    if (this.watcher) {
      await this.watcher.cancel();
      this.watcher = null;
    }
    this.client.close();
  }
}
