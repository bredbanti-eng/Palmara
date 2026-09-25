// gemini-flash-lite-latest is Google's self-updating alias for its current
// fastest/highest-quota flash model (rather than a pinned version like
// "gemini-2.5-flash" or "gemini-3.6-flash", both of which went stale within
// this project's lifetime — one got deprecated outright, the other was
// consistently overloaded). Pointing at the alias avoids that class of bug.
const GEMINI_MODEL = "gemini-flash-lite-latest";
const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Gemini's 503 "currently experiencing high demand" — and a hung/timed-out
// request, which behaves the same way from the caller's perspective — are
// both genuinely transient and worth a couple of short retries. Its 429
// (free-tier quota: 5 requests/min per model) is NOT worth retrying here:
// Google's own retryDelay is ~30s, far longer than this request should
// block, so fail fast instead and let the quota window clear on its own.
//
// Returns the successful Response, `{ quotaExceeded: true }`, or null.
export async function callGeminiWithRetry(prompt, { timeoutMs = REQUEST_TIMEOUT_MS, generationConfig } = {}) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response;
    try {
      response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            ...(generationConfig ? { generationConfig } : {}),
          }),
        },
        timeoutMs
      );
    } catch (err) {
      console.error(`Gemini request failed (attempt ${attempt}/${maxAttempts}):`, err.name);
      if (attempt === maxAttempts) return null;
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
      continue;
    }

    if (response.ok) return response;

    const errText = await response.text();
    console.error(`Gemini API error (attempt ${attempt}/${maxAttempts}):`, errText);

    if (response.status === 429) {
      return { quotaExceeded: true };
    }
    if (response.status !== 503 || attempt === maxAttempts) {
      return null;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  return null;
}

// Extracts the plain text from a successful generateContent response.
export function extractGeminiText(data) {
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
}

// Requests JSON-mode output matching `schema` (Gemini's OpenAPI-subset
// responseSchema) and returns the parsed object, `{ quotaExceeded: true }`,
// or null. JSON mode is far more reliable than asking the model to follow a
// text-delimiter convention and hoping it complies every time.
export async function callGeminiJSON(prompt, schema, opts = {}) {
  const response = await callGeminiWithRetry(prompt, {
    ...opts,
    generationConfig: { responseMimeType: "application/json", responseSchema: schema },
  });
  if (!response || response.quotaExceeded) return response || null;

  const data = await response.json();
  const rawText = extractGeminiText(data);
  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Failed to parse Gemini JSON output:", err.message, rawText.slice(0, 300));
    return null;
  }
}
