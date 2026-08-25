/** Thrown when no JSON object can be recovered from an LLM response. */
export class JsonExtractionError extends Error {
  override readonly name = "JsonExtractionError";
}

const PREVIEW_LENGTH = 120;

function stripCodeFences(text: string): string {
  if (!text.startsWith("```")) {
    return text;
  }
  const lines = text.split("\n").slice(1);
  while (lines.length > 0 && (lines.at(-1) ?? "").trim() === "") {
    lines.pop();
  }
  if ((lines.at(-1) ?? "").trim().startsWith("```")) {
    lines.pop();
  }
  return lines.join("\n").trim();
}

/**
 * Extracts a JSON object from raw LLM output. Tolerates Markdown code fences
 * and surrounding prose by falling back to the widest `{...}` slice.
 */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const candidates = [trimmed];
  const unfenced = stripCodeFences(trimmed);
  if (unfenced !== trimmed) {
    candidates.push(unfenced);
  }
  for (const source of [...candidates]) {
    const start = source.indexOf("{");
    const end = source.lastIndexOf("}");
    if (start >= 0 && end > start) {
      candidates.push(source.slice(start, end + 1));
    }
  }

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Try the next candidate.
    }
  }

  const preview =
    trimmed.length > PREVIEW_LENGTH ? `${trimmed.slice(0, PREVIEW_LENGTH)}...` : trimmed;
  throw new JsonExtractionError(`No JSON object found in response: ${preview}`);
}
