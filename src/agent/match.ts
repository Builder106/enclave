import { CPT_CODES, ICD10_CODES, findCpt, findIcd10 } from "@/lib/codes";
import {
  type CodeEntry,
  type Extraction,
  type ResolvedExtraction,
} from "@/lib/contract";

const MATCH_THRESHOLD = 0.35;
const EXACT_TOKEN_BONUS = 0.05;

const MISREAD_TO_DIGIT: Record<string, string> = { O: "0", l: "1", S: "5", B: "8" };
const DIGIT_TO_MISREAD: Record<string, string> = { "0": "O", "1": "l", "5": "S", "8": "B" };

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
  );
}

function scoreAgainst(query: Set<string>, entry: CodeEntry): number {
  let score = 0;
  for (const phrase of [entry.description, ...entry.synonyms]) {
    const cand = tokenize(phrase);
    if (cand.size === 0) continue;
    let inter = 0;
    for (const token of query) if (cand.has(token)) inter++;
    const dice = (2 * inter) / (query.size + cand.size);
    const s = Math.min(1, dice + EXACT_TOKEN_BONUS * (inter / query.size));
    if (s > score) score = s;
  }
  return score;
}

export function matchCode(
  description: string,
  candidates: CodeEntry[],
): { entry: CodeEntry; score: number } | null {
  // OCR can swap letters for digits inside words ("cepha1gia"); score the raw
  // query and a misread-restored variant, take the max. Raw always competes,
  // so descriptions with legitimate digits never regress.
  const restored = description.replace(/[0158]/g, (c) => DIGIT_TO_MISREAD[c]);
  const queries = [tokenize(description)];
  if (restored !== description) queries.push(tokenize(restored));

  let best: { entry: CodeEntry; score: number } | null = null;
  for (const entry of candidates) {
    let score = 0;
    for (const query of queries) {
      if (query.size === 0) continue;
      const s = scoreAgainst(query, entry);
      if (s > score) score = s;
    }
    // Strict > keeps ties on the first candidate: deterministic by dataset order.
    if (!best || score > best.score) best = { entry, score };
  }
  return best && best.score >= MATCH_THRESHOLD ? best : null;
}

function repairCodeDigits(s: string): string {
  return s.replace(/[OlSB]/g, (c) => MISREAD_TO_DIGIT[c]);
}

// Printed codes pass through the OCR noise, so lookup tries the literal form
// first, then a digit-misread repair. Unknown codes are kept as printed.
function canonicalIcd10(printed: string): string {
  const raw = printed.trim();
  const found = findIcd10(raw) ?? findIcd10(raw.slice(0, 1) + repairCodeDigits(raw.slice(1)));
  return found ? found.code : raw.toUpperCase();
}

function canonicalCpt(printed: string): string {
  const raw = printed.trim();
  const found = findCpt(raw) ?? findCpt(repairCodeDigits(raw));
  return found ? found.code : raw.toUpperCase();
}

export function resolveCodes(extraction: Extraction): ResolvedExtraction | null {
  const diagnoses: Array<{ description: string; icd10: string }> = [];
  for (const dx of extraction.diagnoses) {
    let icd10: string;
    if (dx.icd10 !== null && dx.icd10.trim() !== "") {
      icd10 = canonicalIcd10(dx.icd10);
    } else {
      const match = matchCode(dx.description, ICD10_CODES);
      if (!match) return null;
      icd10 = match.entry.code;
    }
    diagnoses.push({ description: dx.description, icd10 });
  }

  const lines: Array<Extraction["lines"][number] & { cpt: string }> = [];
  for (const line of extraction.lines) {
    let cpt: string;
    if (line.cpt !== null && line.cpt.trim() !== "") {
      cpt = canonicalCpt(line.cpt);
    } else {
      const match = matchCode(line.description, CPT_CODES);
      if (!match) return null;
      cpt = match.entry.code;
    }
    lines.push({ ...line, cpt });
  }

  // Structural validity is guaranteed by construction; value-format errors
  // (e.g. an OCR-mangled short CPT) are scored by the metrics as field
  // misses rather than voiding the document.
  return { ...extraction, diagnoses, lines };
}
