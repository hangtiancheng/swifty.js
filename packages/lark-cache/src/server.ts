import * as grpc from "@grpc/grpc-js";
import { readFileSync } from "fs";
import { proto, healthProto } from "./proto/index.js";
import { getGroup } from "./group.js";
import { register } from "./register.js";

export interface ServerOptions {
  etcdEndpoints?: string[];
  dialTimeout?: number;
  maxMsgSize?: number;
  tls?: boolean;
  certFile?: string;
  keyFile?: string;
}

const defaultServerOptions: ServerOptions = {
  etcdEndpoints: ["localhost:2379"],
  dialTimeout: 5000,
  maxMsgSize: 4 << 20,
  tls: false,
};

const PEER_REQUEST_METADATA_KEY = "x-peer-request";

function isPeerRequest(call: grpc.ServerUnaryCall<any, any>): boolean {
  const meta = call.metadata.get(PEER_REQUEST_METADATA_KEY);
  return meta.length > 0 && meta[0] === "true";
}

export class Server {
  private addr: string;
  private svcName: string;
  private grpcServer: grpc.Server;
  private abortController: AbortController;
  private opts: ServerOptions;
  private credentials: grpc.ServerCredentials;

  constructor(addr: string, svcName: string, opts?: Partial<ServerOptions>) {
    this.addr = addr;
    this.svcName = svcName;
    this.opts = { ...defaultServerOptions, ...opts };
    this.abortController = new AbortController();

    const serverOpts: grpc.ServerOptions = {
      "grpc.max_receive_message_length": this.opts.maxMsgSize,
    };

    if (this.opts.tls && this.opts.certFile && this.opts.keyFile) {
      const cert = readFileSync(this.opts.certFile);
      const key = readFileSync(this.opts.keyFile);
      this.credentials = grpc.ServerCredentials.createSsl(null, [
        { cert_chain: cert, private_key: key },
      ]);
    } else {
      this.credentials = grpc.ServerCredentials.createInsecure();
    }

    this.grpcServer = new grpc.Server(serverOpts);
    this.grpcServer.addService(proto.pb.LarkCache.service, {
      Get: this.handleGet.bind(this),
      Set: this.handleSet.bind(this),
      Delete: this.handleDelete.bind(this),
    });

    const servingStatuses = new Map<string, number>();
    servingStatuses.set(svcName, 1); // SERVING
    this.grpcServer.addService(healthProto.grpc.health.v1.Health.service, {
      Check: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        const service = call.request.service || "";
        const status = servingStatuses.get(service) ?? 0; // UNKNOWN
        callback(null, { status });
      },
    });
  }

  async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.grpcServer.bindAsync(this.addr, this.credentials, (err) => {
        if (err) {
          reject(new Error(`failed to listen: ${err.message}`));
          return;
        }
        resolve();
      });
    });

    register(this.svcName, this.addr, this.abortController.signal).catch(
      (err) => {
        console.log(`[LarkCache] failed to register service: ${err}`);
      },
    );

    console.log(`[LarkCache] Server starting at ${this.addr}`);
  }

  stop(): void {
    this.abortController.abort();
    this.grpcServer.tryShutdown(() => {
      console.log("[LarkCache] Server stopped");
    });
  }

  private handleGet(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ): void {
    const { group: groupName, key } = call.request;
    const group = getGroup(groupName);
    if (!group) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `group ${groupName} not found`,
      });
      return;
    }

    group
      .get(this.abortController.signal, key)
      .then((view) => {
        callback(null, { value: view.byteSlice() });
      })
      .catch((err) => {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      });
  }

  private handleSet(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ): void {
    const { group: groupName, key, value } = call.request;
    const group = getGroup(groupName);
    if (!group) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `group ${groupName} not found`,
      });
      return;
    }

    const peerRequest = isPeerRequest(call);
    group
      .set(this.abortController.signal, key, Buffer.from(value), peerRequest)
      .then(() => {
        callback(null, { value });
      })
      .catch((err) => {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      });
  }

  private handleDelete(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>,
  ): void {
    const { group: groupName, key } = call.request;
    const group = getGroup(groupName);
    if (!group) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `group ${groupName} not found`,
      });
      return;
    }

    const peerRequest = isPeerRequest(call);
    group
      .delete(this.abortController.signal, key, peerRequest)
      .then(() => {
        callback(null, { value: true });
      })
      .catch((err) => {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      });
  }
}
