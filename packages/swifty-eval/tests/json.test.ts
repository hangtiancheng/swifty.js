import { describe, expect, it } from "vitest";
import { extractJsonObject, JsonExtractionError } from "@/utils/json.js";

describe("extractJsonObject", () => {
  it("parses a plain JSON object", () => {
    expect(extractJsonObject('{"score": 0.8}')).toEqual({ score: 0.8 });
  });

  it("parses a fenced JSON object with a language tag", () => {
    const text = '```json\n{"score": 0.5, "reason": "ok"}\n```';
    expect(extractJsonObject(text)).toEqual({ score: 0.5, reason: "ok" });
  });

  it("parses a fenced JSON object without a language tag", () => {
    expect(extractJsonObject('```\n{"a": 1}\n```')).toEqual({ a: 1 });
  });

  it("recovers a JSON object surrounded by prose", () => {
    const text = '评估结果如下: {"score": 1, "reason": "很好"}, 请查收';
    expect(extractJsonObject(text)).toEqual({ score: 1, reason: "很好" });
  });

  it("rejects a top-level JSON array", () => {
    expect(() => extractJsonObject("[1, 2, 3]")).toThrow(JsonExtractionError);
  });

  it("throws with a preview when no object can be recovered", () => {
    expect(() => extractJsonObject("completely invalid")).toThrow(
      JsonExtractionError,
    );
  });
});
