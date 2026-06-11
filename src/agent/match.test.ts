import { describe, expect, it } from "vitest";
import { CPT_CODES, ICD10_CODES } from "@/lib/codes";
import type { Extraction } from "@/lib/contract";
import { matchCode, resolveCodes } from "@/agent/match";

describe("matchCode", () => {
  it("hits on an exact description", () => {
    const entry = CPT_CODES.find((e) => e.code === "80053")!;
    const match = matchCode(entry.description, CPT_CODES);
    expect(match?.entry.code).toBe("80053");
  });

  it("hits on a synonym", () => {
    const match = matchCode("strep throat", ICD10_CODES);
    expect(match?.entry.code).toBe("J02.0");
  });

  it("hits on a casing/punctuation variant", () => {
    const match = matchCode("comprehensive, METABOLIC panel!!", CPT_CODES);
    expect(match?.entry.code).toBe("80053");
  });

  it("returns null for gibberish", () => {
    expect(matchCode("zzz qqq xxx", CPT_CODES)).toBeNull();
    expect(matchCode("zzz qqq xxx", ICD10_CODES)).toBeNull();
  });
});

describe("resolveCodes", () => {
  it("fills null codes from verbatim descriptions and keeps valid printed codes", () => {
    const dxEntry = ICD10_CODES.find((e) => e.code === "J20.9")!;
    const lineEntry = CPT_CODES.find((e) => e.code === "84443")!;

    const extraction: Extraction = {
      patient: {
        firstName: "Mae",
        lastName: "Carver",
        dob: "1972-04-18",
        mrn: "MRN-2345678",
        phone: "(555) 555-0142",
      },
      encounter: {
        date: "2026-02-11",
        type: "telehealth",
        providerName: "Dr. Ada Yu",
        npi: "1093817465",
      },
      diagnoses: [
        { description: dxEntry.description, icd10: null },
        { description: "Acute upper respiratory infection, unspecified", icd10: "J06.9" },
      ],
      lines: [
        { description: lineEntry.description, cpt: null, units: 1, chargeCents: 6000 },
        { description: "Office visit, established", cpt: "99213", units: 1, chargeCents: 18000 },
      ],
      payer: { name: "Cigna", memberId: "KQM00412233" },
      printedTotalCents: 24000,
    };

    const resolved = resolveCodes(extraction);
    expect(resolved).not.toBeNull();
    expect(resolved!.diagnoses[0].icd10).toBe(dxEntry.code);
    expect(resolved!.diagnoses[1].icd10).toBe("J06.9");
    expect(resolved!.lines[0].cpt).toBe(lineEntry.code);
    expect(resolved!.lines[1].cpt).toBe("99213");
  });
});
