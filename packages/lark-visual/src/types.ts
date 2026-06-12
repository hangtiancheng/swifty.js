/**
 * Shared types for the Lark Frame Tree Visual.
 */
import type { SerializedFrameTree as _SerializedFrameTree } from "@lark.js/mvc";

export type {
  SerializedViewInfo,
  SerializedFrameNode,
  SerializedFrameTree,
} from "@lark.js/mvc";

/** Connection status to the target Lark application */
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/** Message types for the postMessage protocol */
export const MSG_PING = "LARK_VIS_PING" as const;
export const MSG_PONG = "LARK_VIS_PONG" as const;
export const MSG_REQUEST_TREE = "LARK_VIS_REQUEST_TREE" as const;
export const MSG_TREE = "LARK_VIS_TREE" as const;
export const MSG_TREE_DELTA = "LARK_VIS_TREE_DELTA" as const;

/** PostMessage event data types */
export interface VisMessage {
  type: string;
  data?: _SerializedFrameTree;
}
