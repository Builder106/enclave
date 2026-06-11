import type { CodeEntry } from "@/lib/contract";
import { ICD10_CODES } from "./icd10";
import { CPT_CODES } from "./cpt";

export { ICD10_CODES } from "./icd10";
export { CPT_CODES } from "./cpt";

// Dot-stripping makes lookup tolerant of undotted ICD forms ("J069" → "J06.9").
function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/\./g, "");
}

const ICD10_BY_CODE = new Map<string, CodeEntry>(
  ICD10_CODES.map((entry) => [normalize(entry.code), entry]),
);
const CPT_BY_CODE = new Map<string, CodeEntry>(
  CPT_CODES.map((entry) => [normalize(entry.code), entry]),
);

export function findIcd10(code: string): CodeEntry | undefined {
  return ICD10_BY_CODE.get(normalize(code));
}

export function findCpt(code: string): CodeEntry | undefined {
  return CPT_BY_CODE.get(normalize(code));
}
