/**
 * Ultra-robust JSON parser that handles markdown fences, unescaped characters, partial JSON, and trailing text
 */
export function safeParseJson<T = any>(rawText: any, fallbackValue: T): T {
  if (rawText === undefined || rawText === null) {
    return fallbackValue;
  }
  if (typeof rawText === "object") {
    return rawText as T;
  }
  if (typeof rawText !== "string") {
    return fallbackValue;
  }

  const trimmed = rawText.trim();
  if (!trimmed) return fallbackValue;

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed) as T;
  } catch {}

  // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {}

  // 3. Extract JSON object boundary (first { to last })
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const subObj = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(subObj) as T;
    } catch {}
  }

  // 4. Extract JSON array boundary (first [ to last ])
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const subArr = cleaned.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(subArr) as T;
    } catch {}
  }

  // 5. Sanitize trailing commas and stray control characters
  try {
    const sanitized = cleaned
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
    return JSON.parse(sanitized) as T;
  } catch {}

  return fallbackValue;
}
