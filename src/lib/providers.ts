import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { BEDROCK_PRICING, DEFAULTS, type Provider, type TokenUsage } from "@/lib/contract";

const FALLBACK_PRICING = { inPerMTok: 1.0, outPerMTok: 5.0 };

export function getLanguageModel(
  provider: Exclude<Provider, "rules">,
  modelOverride?: string,
): { model: LanguageModel; modelId: string } {
  if (provider === "local") {
    const modelId = modelOverride ?? process.env.OLLAMA_MODEL ?? DEFAULTS.localModel;
    const ollama = createOpenAICompatible({
      name: "ollama",
      baseURL: process.env.OLLAMA_BASE_URL ?? DEFAULTS.ollamaBaseUrl,
      // Without this the JSON schema is never sent and the model invents
      // its own field names (Ollama supports response_format json_schema).
      supportsStructuredOutputs: true,
    });
    return { model: ollama.chatModel(modelId), modelId };
  }
  const modelId = modelOverride ?? process.env.BEDROCK_MODEL ?? DEFAULTS.bedrockModel;
  const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION ?? "us-east-1",
  });
  return { model: bedrock.languageModel(modelId), modelId };
}

export function computeCostUsd(provider: Provider, modelId: string, usage: TokenUsage): number {
  if (provider !== "bedrock") return 0;
  const pricing = BEDROCK_PRICING[modelId] ?? FALLBACK_PRICING;
  return (
    (usage.inputTokens * pricing.inPerMTok + usage.outputTokens * pricing.outPerMTok) / 1e6
  );
}

/** PHI-egress accounting: bytes of document content leaving the machine. */
export function computeEgressBytes(provider: Provider, promptText: string): number {
  return provider === "bedrock" ? Buffer.byteLength(promptText, "utf8") : 0;
}
