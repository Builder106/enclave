import { generateObject, NoObjectGeneratedError } from "ai";
import {
  LenientExtractionSchema,
  type Extraction,
  type LenientExtraction,
  type TokenUsage,
} from "@/lib/contract";
import { getLanguageModel } from "@/lib/providers";

export const EXTRACTION_SYSTEM_PROMPT = [
  "You extract structured billing data from the noisy OCR text of one medical superbill.",
  "Follow these rules exactly:",
  "- Copy descriptions verbatim from the document. Never paraphrase, abbreviate, or invent text.",
  "- The patient Name line holds BOTH names: firstName is the first word, lastName is the rest. Both must be non-empty.",
  "- Every charge is integer CENTS: a printed $123.45 means chargeCents 12345; $1,080.00 means 108000.",
  "- Dates are ISO YYYY-MM-DD.",
  "- icd10 and cpt: transcribe a code only when it is printed in the document (diagnosis codes appear in [brackets]; CPT codes in the services table). When no code is printed, use null. Never guess a code.",
  "- units is the QTY column value for each service line.",
  "- printedTotalCents is the TOTAL DUE amount in cents, or null when no total is printed.",
  "- OCR noise may swap 0/O, 1/l, 5/S, 8/B and mangle spacing. Restore swapped digits only inside strictly numeric fields (dates, phone, NPI, CPT, dollar amounts). Leave words as printed.",
].join("\n");

const trimDeep = (s: string): string => s.replace(/\s+/g, " ").trim();

/** Accepts YYYY-MM-DD as-is; coerces M/D/YYYY and MM-DD-YYYY style dates. */
function normalizeDate(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const us = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  return s;
}

/**
 * Lenient model output → Extraction. The model proposes; this code disposes:
 * whitespace cleanup and date-shape coercion. Structural validity is already
 * grammar-enforced at generation; remaining value-format errors (empty name,
 * malformed MRN) are scored by the metrics as per-field misses — one bad
 * field must not void an otherwise-correct document.
 */
export function normalizeExtraction(lenient: LenientExtraction): {
  extraction: Extraction | null;
  error: string | null;
} {
  const candidate = {
    patient: {
      firstName: trimDeep(lenient.patient.firstName),
      lastName: trimDeep(lenient.patient.lastName),
      dob: normalizeDate(lenient.patient.dob),
      mrn: lenient.patient.mrn.trim().toUpperCase(),
      phone: lenient.patient.phone.trim(),
    },
    encounter: {
      date: normalizeDate(lenient.encounter.date),
      type: lenient.encounter.type,
      providerName: trimDeep(lenient.encounter.providerName),
      npi: lenient.encounter.npi.replace(/\s+/g, ""),
    },
    diagnoses: lenient.diagnoses.map((d) => ({
      description: trimDeep(d.description),
      icd10: d.icd10 === null ? null : d.icd10.trim().toUpperCase(),
    })),
    lines: lenient.lines.map((l) => ({
      description: trimDeep(l.description),
      cpt: l.cpt === null ? null : l.cpt.trim(),
      units: l.units,
      chargeCents: l.chargeCents,
    })),
    payer: {
      name: trimDeep(lenient.payer.name),
      memberId: lenient.payer.memberId.trim(),
    },
    printedTotalCents: lenient.printedTotalCents,
  };
  return { extraction: candidate, error: null };
}

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
      schema: LenientExtractionSchema,
      system: EXTRACTION_SYSTEM_PROMPT,
      prompt: text,
      temperature: 0,
    });
    usage.inputTokens = result.usage.inputTokens ?? 0;
    usage.outputTokens = result.usage.outputTokens ?? 0;
    const normalized = normalizeExtraction(result.object);
    return { ...normalized, usage, modelId };
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
