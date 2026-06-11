import {
  ANOMALY_KINDS,
  DEFAULTS,
  ENCOUNTER_TYPES,
  type AnomalyKind,
  type CodeEntry,
  type ServiceLine,
  type SuperbillTruth,
} from "@/lib/contract";
import { pick, pickInt, shuffle } from "./rng";
import { FIRST_NAMES, LAST_NAMES, PAYER_NAMES, PROVIDER_POOL } from "./pools";

const FALLBACK_FEE_CENTS = 12000;
const MEMBER_ID_ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ";

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function descriptionFor(rng: () => number, entry: CodeEntry): string {
  if (entry.synonyms.length === 0) return entry.description;
  return pick(rng, [entry.description, ...entry.synonyms]);
}

/** Alter exactly one digit (never the leading one) — e.g. 28000 -> 23000. */
function digitSlip(rng: () => number, value: number): number {
  const digits = String(value).split("");
  const i = digits.length > 1 ? pickInt(rng, 1, digits.length - 1) : 0;
  const old = Number(digits[i]);
  digits[i] = String((old + pickInt(rng, 1, 9)) % 10);
  return Number(digits.join(""));
}

export function generateSuperbill(
  rng: () => number,
  codes: { icd10: CodeEntry[]; cpt: CodeEntry[] },
): SuperbillTruth {
  const patient = {
    firstName: pick(rng, FIRST_NAMES),
    lastName: pick(rng, LAST_NAMES),
    dob: isoDate(pickInt(rng, 1940, 2014), pickInt(rng, 1, 12), pickInt(rng, 1, 28)),
    mrn: `MRN-${pickInt(rng, 1000000, 9999999)}`,
    phone: `(${pickInt(rng, 212, 989)}) 555-${String(pickInt(rng, 0, 9999)).padStart(4, "0")}`,
  };

  const provider = pick(rng, PROVIDER_POOL);
  const encounter = {
    date: isoDate(2026, pickInt(rng, 1, 6), pickInt(rng, 1, 28)),
    type: pick(rng, ENCOUNTER_TYPES),
    providerName: provider.name,
    npi: provider.npi,
  };

  const dxCount = pickInt(rng, 1, 3);
  const diagnoses = shuffle(rng, codes.icd10)
    .slice(0, dxCount)
    .map((entry) => ({
      description: descriptionFor(rng, entry),
      icd10: entry.code,
    }));

  const lineCount = pickInt(rng, 1, 4);
  const cptEntries = shuffle(rng, codes.cpt).slice(0, lineCount);
  const lines: ServiceLine[] = cptEntries.map((entry) => {
    const units = rng() < 0.75 ? 1 : pickInt(rng, 2, 3);
    const fee = entry.typicalFeeCents ?? FALLBACK_FEE_CENTS;
    const perUnit = Math.round(fee * (0.8 + rng() * 0.4));
    return {
      description: descriptionFor(rng, entry),
      cpt: entry.code,
      units,
      chargeCents: perUnit * units,
    };
  });

  let memberId = "";
  for (let i = 0; i < 3; i++) {
    memberId += MEMBER_ID_ALPHA[pickInt(rng, 0, MEMBER_ID_ALPHA.length - 1)];
  }
  memberId += String(pickInt(rng, 0, 99999999)).padStart(8, "0");
  const payer = { name: pick(rng, PAYER_NAMES), memberId };

  const injectedAnomalies: AnomalyKind[] = [];
  if (rng() < DEFAULTS.anomalyRate) injectedAnomalies.push(pick(rng, ANOMALY_KINDS));
  const kind = injectedAnomalies.length > 0 ? injectedAnomalies[0] : null;

  if (kind === "duplicate_line") {
    lines.push({ ...lines[pickInt(rng, 0, lines.length - 1)] });
  }
  if (kind === "unit_charge_outlier") {
    const i = pickInt(rng, 0, lines.length - 1);
    const fee = cptEntries[i].typicalFeeCents ?? FALLBACK_FEE_CENTS;
    const perUnit = Math.round(fee * (8 + rng() * 7));
    lines[i] = { ...lines[i], chargeCents: perUnit * lines[i].units };
  }

  // Totals reflect the lines as printed, so duplicate/outlier docs stay
  // internally consistent and carry exactly ONE detectable anomaly.
  const subtotalCents = lines.reduce((sum, line) => sum + line.chargeCents, 0);
  let printedTotalCents = subtotalCents;
  if (kind === "charge_total_mismatch") {
    if (lines.length > 1 && rng() < 0.5) {
      const dropped = pick(rng, lines).chargeCents;
      printedTotalCents =
        dropped > 0 ? subtotalCents - dropped : digitSlip(rng, subtotalCents);
    } else {
      printedTotalCents = digitSlip(rng, subtotalCents);
    }
  }

  return {
    patient,
    encounter,
    diagnoses,
    lines,
    payer,
    subtotalCents,
    printedTotalCents,
    injectedAnomalies,
  };
}
