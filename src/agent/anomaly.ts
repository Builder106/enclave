import { findCpt } from "@/lib/codes";
import type { AnomalyFlag, ResolvedExtraction } from "@/lib/contract";

const OUTLIER_MULTIPLIER = 5;
const PLACEHOLDER_RE = /^(?:n\/?a|none|unknown|missing|-+)$/i;

function usd(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

export function detectAnomalies(resolved: ResolvedExtraction): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];

  const lineSum = resolved.lines.reduce((sum, line) => sum + line.chargeCents, 0);
  if (resolved.printedTotalCents === null) {
    flags.push({
      kind: "missing_field",
      detail: "Document does not print a TOTAL DUE amount.",
    });
  } else if (resolved.printedTotalCents !== lineSum) {
    flags.push({
      kind: "charge_total_mismatch",
      detail: `Printed total ${usd(resolved.printedTotalCents)} does not equal the sum of line charges ${usd(lineSum)}.`,
    });
  }

  const lineCounts = new Map<string, { count: number; cpt: string; description: string }>();
  for (const line of resolved.lines) {
    // OCR doubles/deletes spaces, so key equality must ignore non-alphanumerics.
    const key = `${line.cpt}|${line.description.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    const seen = lineCounts.get(key);
    if (seen) seen.count += 1;
    else lineCounts.set(key, { count: 1, cpt: line.cpt, description: line.description });
  }
  for (const { count, cpt, description } of lineCounts.values()) {
    if (count > 1) {
      flags.push({
        kind: "duplicate_line",
        detail: `Service line "${description}" (CPT ${cpt}) appears ${count} times.`,
      });
    }
  }

  for (const line of resolved.lines) {
    const typical = findCpt(line.cpt)?.typicalFeeCents;
    if (typical === undefined) continue;
    if (line.chargeCents > OUTLIER_MULTIPLIER * typical * line.units) {
      const perUnit = Math.round(line.chargeCents / line.units);
      flags.push({
        kind: "unit_charge_outlier",
        detail: `Per-unit charge ${usd(perUnit)} for CPT ${line.cpt} ("${line.description}") exceeds ${OUTLIER_MULTIPLIER}x the typical fee ${usd(typical)}.`,
      });
    }
  }

  const memberId = resolved.payer.memberId.trim();
  if (memberId === "" || PLACEHOLDER_RE.test(memberId)) {
    flags.push({
      kind: "missing_field",
      detail: "Payer member ID is blank or a placeholder value.",
    });
  }

  return flags;
}
