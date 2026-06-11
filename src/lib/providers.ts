import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import {
  BEDROCK_PRICING,
  DEFAULTS,
  GROQ_PRICING,
  type Provider,
  type TokenUsage,
} from "@/lib/contract";

const FALLBACK_PRICING = { inPerMTok: 1.0, outPerMTok: 5.0 };

/** Providers whose requests carry document bytes off this machine. */
const HOSTED: ReadonlySet<Provider> = new Set(["bedrock", "groq"]);

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
  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    const modelId = modelOverride ?? process.env.GROQ_MODEL ?? DEFAULTS.groqModel;
    const groq = createOpenAICompatible({
      name: "groq",
      baseURL: process.env.GROQ_BASE_URL ?? DEFAULTS.groqBaseUrl,
      apiKey,
      supportsStructuredOutputs: true,
    });
    return { model: groq.chatModel(modelId), modelId };
  }
  const modelId = modelOverride ?? process.env.BEDROCK_MODEL ?? DEFAULTS.bedrockModel;
  const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION ?? "us-east-1",
  });
  return { model: bedrock.languageModel(modelId), modelId };
}

export function computeCostUsd(provider: Provider, modelId: string, usage: TokenUsage): number {
  if (!HOSTED.has(provider)) return 0;
  const table = provider === "groq" ? GROQ_PRICING : BEDROCK_PRICING;
  const pricing = table[modelId] ?? FALLBACK_PRICING;
  return (
    (usage.inputTokens * pricing.inPerMTok + usage.outputTokens * pricing.outPerMTok) / 1e6
  );
}

/** PHI-egress accounting: bytes of document content leaving the machine. */
export function computeEgressBytes(provider: Provider, promptText: string): number {
  return HOSTED.has(provider) ? Buffer.byteLength(promptText, "utf8") : 0;
}
