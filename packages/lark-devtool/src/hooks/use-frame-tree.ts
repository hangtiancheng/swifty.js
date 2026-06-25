/**
 * useFrameTree — React hook for communicating with a Lark application
 * loaded in an iframe via postMessage protocol.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { SerializedFrameTree, ConnectionStatus, VisMessage } from "../types";
import { MSG_PING, MSG_PONG, MSG_REQUEST_TREE, MSG_TREE, MSG_TREE_DELTA } from "../types";

/** Hook configuration */
interface UseFrameTreeConfig {
  /** Target URL to load in the iframe */
  targetUrl: string | null;
  /** Polling interval in ms for tree refresh (default: 2000) */
  pollInterval?: number;
}

/** Hook return value */
interface UseFrameTreeReturn {
  /** Current frame tree data */
  tree: SerializedFrameTree | null;
  /** Connection status */
  status: ConnectionStatus;
  /** Manually refresh the frame tree */
  refresh: () => void;
  /** Force a reconnection even when the target URL is unchanged */
  reconnect: () => void;
  /** Reference to the iframe element for attaching to DOM */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

/**
 * Hook that manages communication with a Lark application iframe.
 *
 * Protocol:
 * 1. Load target URL in iframe
 * 2. Send PING to detect if Lark bridge is present
 * 3. On PONG, request frame tree
 * 4. Listen for TREE and TREE_DELTA responses
 * 5. Periodically re-request tree for updates
 */
export function useFrameTree({
  targetUrl,
  pollInterval = 2000,
}: UseFrameTreeConfig): UseFrameTreeReturn {
  const [tree, setTree] = useState<SerializedFrameTree | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  /**
   * Bumped by `reconnect()` to force the connection effect to re-run even
   * when `targetUrl` is unchanged — e.g. the user clicks "Connect" again
   * after a timeout, with the same URL still in the input.
   */
  const [attempt, setAttempt] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Send a message to the iframe */
  const sendMessage = useCallback(
    (msg: VisMessage) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      const origin = targetUrl ? new URL(targetUrl).origin : "*";
      iframe.contentWindow.postMessage(msg, origin);
    },
    [targetUrl],
  );

  /** Request the frame tree from the iframe */
  const refresh = useCallback(() => {
    sendMessage({ type: MSG_REQUEST_TREE });
  }, [sendMessage]);

  /** Force a reconnection. Bumps `attempt` so the connection effect re-runs
   * (resetting status, restarting the ping interval and timeout). */
  const reconnect = useCallback((): void => {
    setAttempt((a) => a + 1);
  }, []);

  /** Handle incoming postMessage events */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data as VisMessage | undefined;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        case MSG_PONG:
          setStatus("connected");
          if (pingTimerRef.current) {
            clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          sendMessage({ type: MSG_REQUEST_TREE });
          break;

        case MSG_TREE:
          if (data.data) {
            setTree(data.data);
          }
          break;

        case MSG_TREE_DELTA:
          if (data.data) {
            setTree(data.data);
          }
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendMessage]);

  /** When targetUrl changes (or reconnect is called), reset state and start connection */
  useEffect(() => {
    setTree(null);

    if (!targetUrl) {
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");

    // Start ping interval to detect when iframe is ready
    if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    pingTimerRef.current = setInterval(() => {
      sendMessage({ type: MSG_PING });
    }, 1000);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus((s) => (s === "connecting" ? "error" : s));
    }, 10_000);

    return () => {
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [targetUrl, sendMessage, attempt]);

  /** When connected, start polling for tree updates */
  useEffect(() => {
    if (status !== "connected") return;

    // Initial request already sent on PONG

    // Set up polling interval
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      sendMessage({ type: MSG_REQUEST_TREE });
    }, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [status, pollInterval, sendMessage]);

  /** Handle iframe load event */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = (): void => {
      // Wait a moment for the Lark app to initialize, then ping
      setTimeout(() => {
        sendMessage({ type: MSG_PING });
      }, 500);
    };

    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [sendMessage, targetUrl]);

  return { tree, status, refresh, reconnect, iframeRef };
}
