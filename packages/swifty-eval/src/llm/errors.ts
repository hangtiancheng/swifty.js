/** Base class for LLM transport failures. */
export class LLMError extends Error {
  override readonly name: string = "LLMError";
}

/** Raised when the provider rejects a request due to rate limiting (HTTP 429). */
export class LLMRateLimitError extends LLMError {
  override readonly name = "LLMRateLimitError";
}

/** Raised when a completion arrives without any textual content. */
export class LLMEmptyResponseError extends LLMError {
  override readonly name = "LLMEmptyResponseError";
}
