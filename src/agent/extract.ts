import { generateObject, NoObjectGeneratedError } from "ai";
import { ExtractionSchema, type Extraction, type TokenUsage } from "@/lib/contract";
import { getLanguageModel } from "@/lib/providers";

export const EXTRACTION_SYSTEM_PROMPT = [
  "You extract structured billing data from the noisy OCR text of one medical superbill.",
  "Follow these rules exactly:",
  "- Copy descriptions verbatim from the document. Never paraphrase, abbreviate, or invent text.",
  "- Every charge is integer CENTS: a printed $123.45 means chargeCents 12345; $1,080.00 means 108000.",
  "- Dates are ISO YYYY-MM-DD.",
  "- icd10 and cpt: transcribe a code only when it is printed in the document (diagnosis codes appear in [brackets]; CPT codes in the services table). When no code is printed, use null. Never guess a code.",
  "- units is the QTY column value for each service line.",
  "- printedTotalCents is the TOTAL DUE amount in cents, or null when no total is printed.",
  "- OCR noise may swap 0/O, 1/l, 5/S, 8/B and mangle spacing. Restore swapped digits only inside strictly numeric fields (dates, phone, NPI, CPT, dollar amounts). Leave words as printed.",
].join("\n");

export async function llmExtract(
  text: string,
  provider: "local" | "bedrock",
  modelOverride?: string,
): Promise<{
  extraction: Extraction | null;
  usage: TokenUsage;
  modelId: string;
  error: string | null;
}> {
  let modelId = modelOverride ?? provider;
  const usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  try {
    const resolved = getLanguageModel(provider, modelOverride);
    modelId = resolved.modelId;
    const result = await generateObject({
      model: resolved.model,
      schema: ExtractionSchema,
      system: EXTRACTION_SYSTEM_PROMPT,
      prompt: text,
      temperature: 0,
    });
    usage.inputTokens = result.usage.inputTokens ?? 0;
    usage.outputTokens = result.usage.outputTokens ?? 0;
    return { extraction: result.object, usage, modelId, error: null };
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      usage.inputTokens = err.usage?.inputTokens ?? 0;
      usage.outputTokens = err.usage?.outputTokens ?? 0;
    }
    return {
      extraction: null,
      usage,
      modelId,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
