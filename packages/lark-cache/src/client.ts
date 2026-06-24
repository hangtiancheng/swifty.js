import * as grpc from "@grpc/grpc-js";
import { proto } from "./proto/index.js";
import { Peer } from "./peers.js";

export class Client implements Peer {
  private addr: string;
  private grpcClient: any;

  constructor(addr: string) {
    this.addr = addr;
    this.grpcClient = new proto.pb.LarkCache(
      addr,
      grpc.credentials.createInsecure(),
    );
  }

  get(group: string, key: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + 3000);
      this.grpcClient.Get(
        { group, key },
        { deadline, waitForReady: true },
        (err: grpc.ServiceError | null, response: any) => {
          if (err) {
            reject(
              new Error(`failed to get value from lark_cache: ${err.message}`),
            );
            return;
          }
          resolve(Buffer.from(response.value));
        },
      );
    });
  }

  set(group: string, key: string, value: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + 3000);
      this.grpcClient.Set(
        { group, key, value },
        { deadline, waitForReady: true },
        (err: grpc.ServiceError | null) => {
          if (err) {
            reject(
              new Error(`failed to set value to lark_cache: ${err.message}`),
            );
            return;
          }
          resolve();
        },
      );
    });
  }

  delete(group: string, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + 3000);
      this.grpcClient.Delete(
        { group, key },
        { deadline, waitForReady: true },
        (err: grpc.ServiceError | null, response: any) => {
          if (err) {
            reject(
              new Error(
                `failed to delete value from lark_cache: ${err.message}`,
              ),
            );
            return;
          }
          resolve(response.value);
        },
      );
    });
  }

  async close(): Promise<void> {
    this.grpcClient.close();
  }

  getAddr(): string {
    return this.addr;
  }
}
