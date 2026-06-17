/**
 * Shared types for the Lark Frame Tree Devtool.
 */
import type { SerializedFrameTree } from "@lark.js/mvc/devtool";

export type {
  SerializedViewInfo,
  SerializedFrameNode,
  SerializedFrameTree,
} from "@lark.js/mvc/devtool";

/** Connection status to the target Lark application */
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/** Message types for the postMessage protocol */
export const MSG_PING = "LARK_DEVTOOL_PING" as const;
export const MSG_PONG = "LARK_DEVTOOL_PONG" as const;
export const MSG_REQUEST_TREE = "LARK_DEVTOOL_REQUEST_TREE" as const;
export const MSG_TREE = "LARK_DEVTOOL_TREE" as const;
export const MSG_TREE_DELTA = "LARK_DEVTOOL_TREE_DELTA" as const;

/** PostMessage event data types */
export interface VisMessage {
  type: string;
  data?: SerializedFrameTree;
}
