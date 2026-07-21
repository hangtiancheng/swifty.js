import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOADER_OPTIONS: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const swiftyDef = protoLoader.loadSync(
  join(__dirname, "swifty.proto"),
  LOADER_OPTIONS,
);
export const proto = grpc.loadPackageDefinition(swiftyDef) as any;

const healthDef = protoLoader.loadSync(
  join(__dirname, "health.proto"),
  LOADER_OPTIONS,
);
export const healthProto = grpc.loadPackageDefinition(healthDef) as any;
