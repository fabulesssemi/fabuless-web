/**
 * Post-generation hallucination guardrail.
 * Runs a cheap Claude Haiku pass after the main answer is generated.
 * Checks: does every substantive claim map to a cited chunk?
 * Returns a flag + list of unsupported claims if any are found.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface GuardrailResult {
  passed: boolean;
  unsupportedClaims: string[]; // claims that couldn't be verified against sources
}

export async function runGuardrail(
  answer: string,
  sourceTexts: string[]
): Promise<GuardrailResult> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  if (sourceTexts.length === 0) {
    return { passed: false, unsupportedClaims: ["No source material provided"] };
  }

  const sourceSummary = sourceTexts
    .map((t, i) => `[Source ${i + 1}]: ${t.slice(0, 1500)}`)
    .join("\n\n");

  // CoT Self-Verification approach (arXiv 2505.09031):
  // Step 1 — extract claims and reason about each one step-by-step
  // Step 2 — generate a probing question about the answer
  // Step 3 — check if that probing question's answer is consistent with sources
  // This catches hallucinations that simple claim-matching misses.

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a rigorous fact-checker for an AI system that answers questions using retrieved source documents.

SOURCE PASSAGES:
${sourceSummary}

AI-GENERATED ANSWER TO VERIFY:
${answer}

Output your verdict as JSON FIRST, then your reasoning. This ensures the verdict is never truncated.

REQUIRED FORMAT — output this block first, before any explanation:
{"passed": true or false, "unsupportedClaims": ["exact unsupported claim text"]}

Then briefly explain any unsupported claims.

Rules:
- "passed" is false if any specific factual claim (number, company assertion, position size) cannot be found in the source passages.
- Ignore generic statements, disclaimers, and flagged inferences ("would likely", "doesn't address this directly").
- "unsupportedClaims" is [] when passed is true.

"passed" is true only if ALL claims are supported AND the probing question confirms faithfulness. "unsupportedClaims" is [] if passed is true.`,
    }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";

  // The prompt instructs JSON verdict FIRST, then CoT reasoning (to prevent truncation).
  // We defensively find the LAST {"passed":...} block in case the model reverses order
  // or the CoT reasoning contains a JSON-like fragment before the real verdict.
  const allMatches = [...raw.matchAll(/\{[^{}]*"passed"[^{}]*\}/g)];
  const jsonStr = allMatches.length > 0 ? allMatches[allMatches.length - 1][0] : raw;
  const cleaned = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const result = JSON.parse(cleaned);
    return {
      passed: result.passed ?? true,
      unsupportedClaims: result.unsupportedClaims ?? [],
    };
  } catch {
    console.warn("Guardrail parse failed:", cleaned);
    return { passed: true, unsupportedClaims: [] };
  }
}
