/**
 * Agent chat store
 *
 * Protocol: OpenAI Chat Completions compatible (baseURL + apiKey + model).
 * Streaming: fetch + ReadableStream, line-by-line SSE `data: {...}` frame parsing.
 * Cancellation: AbortController — call abort() during an active send to cancel.
 * Persistence: localStorage["lark-index:chat"], structure { config, messages }.
 *
 * Design trade-offs:
 *  - No system prompt template abstraction; a single system role is governed by config.systemPrompt
 *  - No multi-conversation switching; the current message list is "the conversation", clear resets it
 *  - Errors surface as role=error messages rather than uncaught promise rejections
 */
import { create } from "@lark.js/mvc";

export type ChatRole = "user" | "assistant" | "system" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export interface ChatConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
}

export interface ChatStore {
  config: ChatConfig;
  messages: ChatMessage[];
  sending: boolean;
  setConfig: (patch: Partial<ChatConfig>) => void;
  send: (text: string) => Promise<void>;
  abort: () => void;
  clear: () => void;
}

interface PersistShape {
  config: ChatConfig;
  messages: ChatMessage[];
}

const STORAGE_KEY = "lark-index:chat";

const DEFAULT_CONFIG: ChatConfig = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  systemPrompt: "你是一个简洁、专业、友好的助手。回答尽量短。",
};

function genId(): string {
  return `cm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function coerceMessage(x: unknown): ChatMessage | undefined {
  if (!x || typeof x !== "object") return undefined;
  const o = x as Record<string, unknown>;
  if (typeof o["id"] !== "string" || typeof o["content"] !== "string") {
    return undefined;
  }
  const role = o["role"];
  if (
    role !== "user" &&
    role !== "assistant" &&
    role !== "system" &&
    role !== "error"
  ) {
    return undefined;
  }
  const createdAt =
    typeof o["createdAt"] === "number" ? o["createdAt"] : Date.now();
  return { id: o["id"], role, content: o["content"], createdAt };
}

function coerceConfig(x: unknown): ChatConfig {
  if (!x || typeof x !== "object") return { ...DEFAULT_CONFIG };
  const o = x as Record<string, unknown>;
  return {
    baseURL:
      typeof o["baseURL"] === "string" && o["baseURL"]
        ? o["baseURL"]
        : DEFAULT_CONFIG.baseURL,
    apiKey: typeof o["apiKey"] === "string" ? o["apiKey"] : "",
    model:
      typeof o["model"] === "string" && o["model"]
        ? o["model"]
        : DEFAULT_CONFIG.model,
    systemPrompt:
      typeof o["systemPrompt"] === "string"
        ? o["systemPrompt"]
        : DEFAULT_CONFIG.systemPrompt,
  };
}

function loadFromStorage(): PersistShape {
  const fallback: PersistShape = {
    config: { ...DEFAULT_CONFIG },
    messages: [],
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const config = coerceConfig(parsed?.config);
    const messages: ChatMessage[] = [];
    if (Array.isArray(parsed?.messages)) {
      for (const m of parsed.messages) {
        const coerced = coerceMessage(m);
        if (coerced) messages.push(coerced);
      }
    }
    return { config, messages };
  } catch (e) {
    console.warn("[@lark.js/index] chat: load failed, fallback:", e);
    return fallback;
  }
}

function persistData(snapshot: PersistShape): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.error("[@lark.js/index] chat: persist failed:", e);
  }
}

let currentAbort: AbortController | undefined;

const initial = loadFromStorage();

const useChatStore = create<ChatStore>("chat", (set, get) => ({
  config: initial.config,
  messages: initial.messages,
  sending: false,

  setConfig(patch) {
    const prev = get().config;
    const next: ChatConfig = { ...prev, ...patch };
    if (patch.baseURL !== undefined) {
      next.baseURL = patch.baseURL.trim() || DEFAULT_CONFIG.baseURL;
    }
    if (patch.model !== undefined) {
      next.model = patch.model.trim() || DEFAULT_CONFIG.model;
    }
    if (patch.apiKey !== undefined) {
      next.apiKey = patch.apiKey.trim();
    }
    if (patch.systemPrompt !== undefined) {
      next.systemPrompt = patch.systemPrompt;
    }
    set({ config: next });
    persistData({ config: next, messages: get().messages });
  },

  async send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (get().sending) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const assistantMsg: ChatMessage = {
      id: genId(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    let working: ChatMessage[] = [...get().messages, userMsg, assistantMsg];
    set({ messages: working, sending: true });
    persistData({ config: get().config, messages: working });

    const cfg = get().config;
    if (!cfg.apiKey) {
      finalizeWithError(
        set,
        get,
        working,
        assistantMsg.id,
        "未配置 API Key，请在底部齿轮按钮里填写。",
        undefined,
      );
      return;
    }

    const ctrl = new AbortController();
    currentAbort = ctrl;

    const apiMessages = buildApiMessages(
      cfg.systemPrompt,
      get().messages,
      assistantMsg.id,
    );
    const url = `${cfg.baseURL.replace(/\/$/, "")}/chat/completions`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: apiMessages,
          stream: true,
        }),
      });
    } catch (e) {
      const msg = ctrl.signal.aborted
        ? "（已中断）"
        : `请求失败：${e instanceof Error ? e.message : String(e)}`;
      finalizeWithError(set, get, working, assistantMsg.id, msg, ctrl);
      return;
    }

    if (!response.ok || !response.body) {
      const detail = await safeReadErrorBody(response);
      finalizeWithError(
        set,
        get,
        working,
        assistantMsg.id,
        `HTTP ${response.status}${detail ? ` · ${detail}` : ""}`,
        ctrl,
      );
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let aborted = false;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || !line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          const delta = parseDelta(payload);
          if (!delta) continue;
          working = appendToMessage(working, assistantMsg.id, delta);
          set({ messages: working });
        }
      }
    } catch (e) {
      if (ctrl.signal.aborted) {
        aborted = true;
      } else {
        finalizeWithError(
          set,
          get,
          working,
          assistantMsg.id,
          `流式读取失败：${e instanceof Error ? e.message : String(e)}`,
          ctrl,
        );
        return;
      }
    }

    if (aborted) {
      working = appendToMessage(working, assistantMsg.id, "\n\n（已中断）");
      set({ messages: working });
    }
    set({ sending: false });
    if (currentAbort === ctrl) currentAbort = undefined;
    persistData({ config: get().config, messages: working });
  },

  abort() {
    if (currentAbort) currentAbort.abort();
  },

  clear() {
    if (get().sending && currentAbort) currentAbort.abort();
    set({ messages: [] });
    persistData({ config: get().config, messages: [] });
  },
}));

export default useChatStore;

// ── helpers ──

function buildApiMessages(
  systemPrompt: string,
  allMessages: readonly ChatMessage[],
  excludeId: string,
): { role: "system" | "user" | "assistant"; content: string }[] {
  const out: { role: "system" | "user" | "assistant"; content: string }[] = [];
  if (systemPrompt.trim()) {
    out.push({ role: "system", content: systemPrompt });
  }
  for (const m of allMessages) {
    if (m.id === excludeId) continue;
    if (m.role === "user" || m.role === "assistant") {
      if (m.content.trim()) out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

function parseDelta(payload: string): string | undefined {
  try {
    const obj = JSON.parse(payload);
    const choices = obj?.choices;
    if (!Array.isArray(choices) || choices.length === 0) return undefined;
    const delta = choices[0]?.delta?.content;
    if (typeof delta === "string" && delta.length > 0) return delta;
    return undefined;
  } catch {
    return undefined;
  }
}

function appendToMessage(
  list: readonly ChatMessage[],
  id: string,
  delta: string,
): ChatMessage[] {
  return list.map((m) =>
    m.id === id ? { ...m, content: m.content + delta } : m,
  );
}

async function safeReadErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return "";
    try {
      const obj = JSON.parse(text);
      const message = obj?.error?.message ?? obj?.message ?? obj?.error ?? "";
      if (typeof message === "string" && message) return message.slice(0, 200);
    } catch {
      /* non-JSON */
    }
    return text.slice(0, 200);
  } catch {
    return "";
  }
}

function finalizeWithError(
  setState: (partial: Partial<ChatStore>) => void,
  getState: () => ChatStore,
  working: readonly ChatMessage[],
  assistantId: string,
  errorText: string,
  ctrl: AbortController | undefined,
): void {
  const next = working.map((m) =>
    m.id === assistantId
      ? { ...m, role: "error" as const, content: errorText }
      : m,
  );
  setState({ messages: next, sending: false });
  if (ctrl !== undefined && currentAbort === ctrl) {
    currentAbort = undefined;
  }
  persistData({ config: getState().config, messages: next });
}
