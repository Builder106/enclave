import { DEFAULTS, type EncounterType, type SuperbillTruth } from "@/lib/contract";
import { pick, pickInt } from "./rng";
import { CLINIC_LETTERHEADS } from "./pools";

const ENCOUNTER_LABELS: Record<EncounterType, string> = {
  office_visit: "Office Visit",
  telehealth: "Telehealth",
  urgent_care: "Urgent Care",
  preventive: "Preventive Visit",
};

// Deliberately avoids toLocaleString: locale output is environment-dependent.
function usd(cents: number): string {
  const dollars = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${dollars}.${String(cents % 100).padStart(2, "0")}`;
}

export function renderClean(truth: SuperbillTruth, rng: () => number): string {
  const letterhead = pick(rng, CLINIC_LETTERHEADS);
  const showCodes = rng() < DEFAULTS.printedCodeRate;
  const missingField = truth.injectedAnomalies.includes("missing_field")
    ? rng() < 0.5
      ? "dob"
      : "memberId"
    : null;

  const out: string[] = [...letterhead, ""];
  out.push("STATEMENT OF SERVICES / SUPERBILL", "");

  out.push("PATIENT");
  out.push(`  Name: ${truth.patient.firstName} ${truth.patient.lastName}`);
  if (missingField !== "dob") out.push(`  DOB: ${truth.patient.dob}`);
  out.push(`  MRN: ${truth.patient.mrn}`);
  out.push(`  Phone: ${truth.patient.phone}`);
  out.push("");

  out.push("ENCOUNTER");
  out.push(`  Date of Service: ${truth.encounter.date}`);
  out.push(`  Visit Type: ${ENCOUNTER_LABELS[truth.encounter.type]}`);
  out.push(`  Rendering Provider: ${truth.encounter.providerName}`);
  out.push(`  NPI: ${truth.encounter.npi}`);
  out.push("");

  out.push("DIAGNOSES");
  truth.diagnoses.forEach((dx, i) => {
    out.push(`  ${i + 1}. ${dx.description}${showCodes ? `  [${dx.icd10}]` : ""}`);
  });
  out.push("");

  out.push("SERVICES");
  if (showCodes) {
    out.push(`  ${"DESCRIPTION".padEnd(46)}${"CPT".padEnd(8)}${"QTY".padEnd(5)}${"CHARGE".padStart(10)}`);
    out.push(`  ${"-".repeat(69)}`);
    for (const line of truth.lines) {
      out.push(
        `  ${line.description.padEnd(46)}${line.cpt.padEnd(8)}${String(line.units).padEnd(5)}${usd(line.chargeCents).padStart(10)}`,
      );
    }
  } else {
    out.push(`  ${"DESCRIPTION".padEnd(46)}${"QTY".padEnd(5)}${"CHARGE".padStart(10)}`);
    out.push(`  ${"-".repeat(61)}`);
    for (const line of truth.lines) {
      out.push(
        `  ${line.description.padEnd(46)}${String(line.units).padEnd(5)}${usd(line.chargeCents).padStart(10)}`,
      );
    }
  }
  out.push("");
  out.push(`  TOTAL DUE: ${usd(truth.printedTotalCents)}`);
  out.push("");

  out.push("INSURANCE / PAYER");
  out.push(`  Plan: ${truth.payer.name}`);
  if (missingField !== "memberId") out.push(`  Member ID: ${truth.payer.memberId}`);
  out.push("");

  return out.join("\n");
}

const MISREAD_RATE = 0.015;
const LETTER_MISREADS: Record<string, string> = { O: "0", l: "1", S: "5", B: "8" };
const DIGIT_MISREADS: Record<string, string> = { "0": "O", "1": "l", "5": "S", "8": "B" };

function findRanges(text: string, re: RegExp): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push([m.index, m.index + m[0].length]);
  return out;
}

function inRanges(ranges: ReadonlyArray<[number, number]>, i: number): boolean {
  for (const [start, end] of ranges) if (i >= start && i < end) return true;
  return false;
}

export function addOcrNoise(clean: string, rng: () => number): string {
  // Random-case flips on header words only: all-caps lines with no digits, so
  // the MRN and dollar amounts can never be touched by this pass.
  const text = clean
    .split("\n")
    .map((line) => {
      if (!/[A-Z]/.test(line) || /[a-z0-9]/.test(line) || rng() >= 0.4) return line;
      const chars = line.split("");
      const flips = pickInt(rng, 1, 2);
      for (let k = 0; k < flips; k++) {
        const i = pickInt(rng, 0, chars.length - 1);
        if (chars[i] >= "A" && chars[i] <= "Z") chars[i] = chars[i].toLowerCase();
      }
      return chars.join("");
    })
    .join("\n");

  const mrnRanges = findRanges(text, /MRN-\d{7}/g);
  const moneyRanges = findRanges(text, /\$[\d,]*\d\.\d{2}/g);
  // The pipeline must stay solvable: at most ONE corrupted digit across all
  // dollar amounts in the document.
  let moneyDigitBudget = 1;

  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inRanges(mrnRanges, i)) {
      out += c;
      continue;
    }
    if (c === "r" && text[i + 1] === "n" && rng() < MISREAD_RATE) {
      out += "m";
      i++;
      continue;
    }
    if (c === " ") {
      const r = rng();
      if (r < 0.008) out += "  ";
      else if (r >= 0.014) out += c;
      continue;
    }
    if (c >= "0" && c <= "9") {
      const sub = DIGIT_MISREADS[c];
      if (sub !== undefined && rng() < MISREAD_RATE) {
        if (inRanges(moneyRanges, i)) {
          if (moneyDigitBudget > 0) {
            moneyDigitBudget--;
            out += sub;
            continue;
          }
        } else {
          out += sub;
          continue;
        }
      }
      out += c;
      continue;
    }
    const sub = LETTER_MISREADS[c];
    if (sub !== undefined && rng() < MISREAD_RATE) {
      out += sub;
      continue;
    }
    out += c;
  }
  return out;
}
