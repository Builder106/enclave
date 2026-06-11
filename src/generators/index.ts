import { DEFAULTS, type GeneratedDocument } from "@/lib/contract";
import { CPT_CODES, ICD10_CODES } from "@/lib/codes";
import { createRng } from "./rng";
import { generateSuperbill } from "./superbill";
import { addOcrNoise, renderClean } from "./render";

export function generateBatch(
  seed: number,
  opts?: { evalCount?: number; devCount?: number },
): GeneratedDocument[] {
  const evalCount = opts?.evalCount ?? DEFAULTS.evalDocCount;
  const devCount = opts?.devCount ?? DEFAULTS.devDocCount;
  const docs: GeneratedDocument[] = [];
  for (let index = 0; index < evalCount + devCount; index++) {
    // Per-document derived seed: docs are stable under count changes.
    const rng = createRng(seed * 1000003 + index);
    const truth = generateSuperbill(rng, { icd10: ICD10_CODES, cpt: CPT_CODES });
    const cleanText = renderClean(truth, rng);
    const text = addOcrNoise(cleanText, rng);
    docs.push({
      id: `DOC-${String(index + 1).padStart(5, "0")}`,
      seed,
      index,
      truth,
      text,
      cleanText,
      split: index < evalCount ? "eval" : "dev",
    });
  }
  return docs;
}

export { createRng } from "./rng";
export { addOcrNoise, renderClean } from "./render";
