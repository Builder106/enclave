import { describe, expect, it } from "vitest";
import { generateBatch } from "@/generators";
import { rulesExtract } from "@/agent/rules-extractor";

describe("rulesExtract", () => {
  const docs = generateBatch(7)
    .filter((d) => d.truth.injectedAnomalies.length === 0)
    .slice(0, 5);

  it("has five anomaly-free docs to work with", () => {
    expect(docs).toHaveLength(5);
  });

  it("extracts all five clean texts, reproducing MRN and printed total exactly", () => {
    for (const doc of docs) {
      const extraction = rulesExtract(doc.cleanText);
      expect(extraction).not.toBeNull();
      expect(extraction!.patient.mrn).toBe(doc.truth.patient.mrn);
      expect(extraction!.printedTotalCents).toBe(doc.truth.printedTotalCents);
    }
  });

  it("stays non-null on at least 3 of 5 noisy texts", () => {
    const parsed = docs.filter((doc) => rulesExtract(doc.text) !== null);
    expect(parsed.length).toBeGreaterThanOrEqual(3);
  });
});
