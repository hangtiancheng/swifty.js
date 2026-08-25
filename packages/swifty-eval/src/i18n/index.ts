import { EN_MESSAGES, type Messages, ZH_MESSAGES } from "./messages.js";

export type Language = "zh" | "en";
export type { Messages };

const ZH_OUTPUT_DIRECTIVE = "Please respond in Simplified Chinese throughout.";

let currentLanguage: Language = "en";

/** Sets the global locale used for report copy and LLM output language. */
export function configureI18n(language: Language): void {
  currentLanguage = language;
}

/** Returns the active locale; defaults to `"en"` until configured. */
export function getLanguage(): Language {
  return currentLanguage;
}

/** Returns the message catalog for the active locale. */
export function getMessages(): Messages {
  return currentLanguage === "zh" ? ZH_MESSAGES : EN_MESSAGES;
}

/**
 * Appends the output-language directive for the active locale to a system
 * prompt; empty for `"en"`, so English prompts pass through unchanged.
 */
export function withOutputLanguageDirective(prompt: string): string {
  return currentLanguage === "zh" ? `${prompt}\n\n${ZH_OUTPUT_DIRECTIVE}` : prompt;
}
