import { afterEach, describe, expect, it } from "vitest";
import { CoherenceEvaluator } from "@/evaluator/coherence.js";
import {
  configureI18n,
  getLanguage,
  getMessages,
  withOutputLanguageDirective,
} from "@/i18n/index.js";
import { EN_MESSAGES, ZH_MESSAGES } from "@/i18n/messages.js";
import { DIMENSION_KEYS } from "@/models/evaluation.js";
import { DEFAULT_USER_PROFILES, selectProfiles } from "@/simulator/profiles.js";
import { createFakeClient, makeRecord, makeTask } from "./fakes.js";

afterEach(() => {
  configureI18n("en");
});

describe("i18n locale", () => {
  it("defaults to English", () => {
    expect(getLanguage()).toBe("en");
    expect(getMessages()).toBe(EN_MESSAGES);
  });

  it("switches catalogs via configureI18n", () => {
    configureI18n("zh");
    expect(getLanguage()).toBe("zh");
    expect(getMessages()).toBe(ZH_MESSAGES);
    expect(getMessages().reportTitle).toBe("对话模型任务指令遵循评估报告");
  });

  it("keeps both catalogs aligned with the canonical dimensions and termination reasons", () => {
    for (const messages of [ZH_MESSAGES, EN_MESSAGES]) {
      expect(Object.keys(messages.dimensionLabels)).toEqual([...DIMENSION_KEYS]);
      expect(Object.keys(messages.terminationReasons)).toEqual([
        "userRefused",
        "userEndedConversation",
        "maxRoundsReached",
      ]);
    }
  });
});

describe("output language directive", () => {
  it("leaves prompts unchanged in English", () => {
    expect(withOutputLanguageDirective("You are a judge.")).toBe("You are a judge.");
  });

  it("appends the Simplified Chinese directive in zh mode", () => {
    configureI18n("zh");
    expect(withOutputLanguageDirective("You are a judge.")).toBe(
      "You are a judge.\n\nPlease respond in Simplified Chinese throughout.",
    );
  });

  it("applies the directive to judge system prompts in zh mode", async () => {
    configureI18n("zh");
    const { client, transport } = createFakeClient(['{"score": 0.5, "reason": "r"}']);
    await new CoherenceEvaluator(client, 1).evaluate(makeRecord([["model", "你好"]]), makeTask());

    const systemPrompt = transport.requests[0]?.messages[0]?.content ?? "";
    expect(systemPrompt).toContain("You are an expert evaluator of dialogue coherence.");
    expect(systemPrompt).toContain("Please respond in Simplified Chinese throughout.");
  });

  it("keeps judge system prompts untouched in en mode", async () => {
    const { client, transport } = createFakeClient(['{"score": 0.5, "reason": "r"}']);
    await new CoherenceEvaluator(client, 1).evaluate(makeRecord([["model", "hello"]]), makeTask());

    const systemPrompt = transport.requests[0]?.messages[0]?.content ?? "";
    expect(systemPrompt).toContain("You are an expert evaluator of dialogue coherence.");
    expect(systemPrompt).not.toContain("Simplified Chinese");
  });
});

describe("locale-dependent data", () => {
  it("provides rider names per language", () => {
    expect(EN_MESSAGES.sampleRiderNames).toContain("Alex");
    configureI18n("zh");
    expect(getMessages().sampleRiderNames).toContain("小王");
  });

  it("ships English-only built-in profiles and selects them by name", () => {
    for (const profile of DEFAULT_USER_PROFILES) {
      expect(profile.name).toMatch(/^[A-Za-z ]+$/);
      expect(profile.systemPrompt).not.toMatch(/\p{Script=Han}/u);
    }
    expect(selectProfiles(["Cooperative User", "Missing User"]).map((p) => p.name)).toEqual([
      "Cooperative User",
    ]);
  });
});
