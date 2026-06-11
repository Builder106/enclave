import type {
  AnomalyFlag,
  DocumentRunResult,
  Extraction,
  GeneratedDocument,
  Provider,
  ResolvedExtraction,
  TokenUsage,
} from "@/lib/contract";
import { computeCostUsd, computeEgressBytes } from "@/lib/providers";
import { detectAnomalies } from "./anomaly";
import { EXTRACTION_SYSTEM_PROMPT, llmExtract } from "./extract";
import { resolveCodes } from "./match";
import { rulesExtract } from "./rules-extractor";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function runDocument(
  doc: Pick<GeneratedDocument, "id" | "text">,
  opts: { provider: Provider; model?: string },
): Promise<DocumentRunResult> {
  const { provider } = opts;
  let extraction: Extraction | null = null;
  let usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  let model = "deterministic";
  let error: string | null = null;
  let promptText = "";

  // Wall-clock latency is a measurement edge, not domain logic: it brackets
  // only the extraction step.
  const start = performance.now();
  if (provider === "rules") {
    try {
      extraction = rulesExtract(doc.text);
      if (extraction === null) error = "unrecoverable document structure";
    } catch (err) {
      error = errorMessage(err);
    }
  } else {
    promptText = `${EXTRACTION_SYSTEM_PROMPT}\n\n${doc.text}`;
    const result = await llmExtract(doc.text, provider, opts.model);
    extraction = result.extraction;
    usage = result.usage;
    model = result.modelId;
    error = result.error;
  }
  const latencyMs = performance.now() - start;

  let resolved: ResolvedExtraction | null = null;
  let anomalies: AnomalyFlag[] = [];
  if (extraction !== null) {
    try {
      resolved = resolveCodes(extraction);
      if (resolved !== null) anomalies = detectAnomalies(resolved);
    } catch (err) {
      error = error ?? errorMessage(err);
    }
  }

  return {
    documentId: doc.id,
    provider,
    model,
    extraction,
    resolved,
    anomalies,
    latencyMs,
    usage,
    costUsd: computeCostUsd(provider, model, usage),
    egressBytes: computeEgressBytes(provider, promptText),
    error,
  };
}
