// Relative import: this graph must load under plain tsx, which does not
// resolve the "@" path alias.
import type {
  DocumentRunResult,
  EvalMetrics,
  Extraction,
  FieldScore,
  GeneratedDocument,
  PRF1,
  SuperbillTruth,
} from "../lib/contract";

const norm = (s: string): string => s.trim().toLowerCase();

interface ScalarFieldSpec {
  field: string;
  truth: (t: SuperbillTruth) => string | number;
  predicted: (e: Extraction) => string | number | null;
}

const SCALAR_FIELDS: readonly ScalarFieldSpec[] = [
  { field: "patient.firstName", truth: (t) => t.patient.firstName, predicted: (e) => e.patient.firstName },
  { field: "patient.lastName", truth: (t) => t.patient.lastName, predicted: (e) => e.patient.lastName },
  { field: "patient.dob", truth: (t) => t.patient.dob, predicted: (e) => e.patient.dob },
  { field: "patient.mrn", truth: (t) => t.patient.mrn, predicted: (e) => e.patient.mrn },
  { field: "patient.phone", truth: (t) => t.patient.phone, predicted: (e) => e.patient.phone },
  { field: "encounter.date", truth: (t) => t.encounter.date, predicted: (e) => e.encounter.date },
  { field: "encounter.type", truth: (t) => t.encounter.type, predicted: (e) => e.encounter.type },
  { field: "encounter.providerName", truth: (t) => t.encounter.providerName, predicted: (e) => e.encounter.providerName },
  { field: "encounter.npi", truth: (t) => t.encounter.npi, predicted: (e) => e.encounter.npi },
  { field: "payer.name", truth: (t) => t.payer.name, predicted: (e) => e.payer.name },
  { field: "payer.memberId", truth: (t) => t.payer.memberId, predicted: (e) => e.payer.memberId },
  { field: "printedTotalCents", truth: (t) => t.printedTotalCents, predicted: (e) => e.printedTotalCents },
];

function scalarCorrect(spec: ScalarFieldSpec, truth: SuperbillTruth, extraction: Extraction): boolean {
  const expected = spec.truth(truth);
  const actual = spec.predicted(extraction);
  // A predicted null is only forgivable when the generator deliberately
  // omitted a field from the document.
  if (actual === null) return truth.injectedAnomalies.includes("missing_field");
  if (typeof expected === "number" || typeof actual === "number") return expected === actual;
  return norm(expected) === norm(actual);
}

type Multiset = Map<string, number>;

function toMultiset(codes: readonly string[]): Multiset {
  const m: Multiset = new Map();
  for (const code of codes) {
    const key = norm(code);
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return m;
}

function multisetSize(m: Multiset): number {
  let n = 0;
  for (const count of m.values()) n += count;
  return n;
}

function multisetIntersectionSize(a: Multiset, b: Multiset): number {
  let n = 0;
  for (const [key, count] of a) n += Math.min(count, b.get(key) ?? 0);
  return n;
}

function multisetEquals(a: Multiset, b: Multiset): boolean {
  if (a.size !== b.size) return false;
  for (const [key, count] of a) if (b.get(key) !== count) return false;
  return true;
}

function prf1(tp: number, predictedTotal: number, actualTotal: number): PRF1 {
  const precision = predictedTotal === 0 ? (actualTotal === 0 ? 1 : 0) : tp / predictedTotal;
  const recall = actualTotal === 0 ? (predictedTotal === 0 ? 1 : 0) : tp / actualTotal;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}

function percentileNearestRank(sortedAsc: readonly number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const rank = Math.min(Math.max(Math.ceil((p / 100) * sortedAsc.length), 1), sortedAsc.length);
  return sortedAsc[rank - 1];
}

export function computeMetrics(docs: GeneratedDocument[], results: DocumentRunResult[]): EvalMetrics {
  const docById = new Map(docs.map((d) => [d.id, d]));
  const perField: FieldScore[] = SCALAR_FIELDS.map((s) => ({ field: s.field, correct: 0, total: 0 }));

  let parsed = 0;
  let exactMatches = 0;
  let codeTp = 0;
  let codePredicted = 0;
  let codeActual = 0;
  let anomalyTp = 0;
  let anomalyPredicted = 0;
  let anomalyActual = 0;
  let totalCostUsd = 0;
  let egressBytesTotal = 0;
  const latencies: number[] = [];

  for (const result of results) {
    const doc = docById.get(result.documentId);
    if (!doc) throw new Error(`computeMetrics: no document for result ${result.documentId}`);
    const truth = doc.truth;

    if (result.extraction !== null) parsed++;
    latencies.push(result.latencyMs);
    totalCostUsd += result.costUsd;
    egressBytesTotal += result.egressBytes;

    let allFieldsCorrect = true;
    SCALAR_FIELDS.forEach((spec, i) => {
      perField[i].total++;
      if (result.extraction !== null && scalarCorrect(spec, truth, result.extraction)) {
        perField[i].correct++;
      } else {
        allFieldsCorrect = false;
      }
    });

    const truthCodes = toMultiset([
      ...truth.diagnoses.map((d) => d.icd10),
      ...truth.lines.map((l) => l.cpt),
    ]);
    const predictedCodes: Multiset = result.resolved
      ? toMultiset([
          ...result.resolved.diagnoses.map((d) => d.icd10),
          ...result.resolved.lines.map((l) => l.cpt),
        ])
      : new Map();
    codeTp += multisetIntersectionSize(predictedCodes, truthCodes);
    codePredicted += multisetSize(predictedCodes);
    codeActual += multisetSize(truthCodes);

    const truthKinds = new Set(truth.injectedAnomalies);
    const predictedKinds = new Set(result.anomalies.map((a) => a.kind));
    for (const kind of predictedKinds) if (truthKinds.has(kind)) anomalyTp++;
    anomalyPredicted += predictedKinds.size;
    anomalyActual += truthKinds.size;

    if (
      allFieldsCorrect &&
      result.resolved !== null &&
      multisetEquals(predictedCodes, truthCodes) &&
      result.resolved.lines.length === truth.lines.length
    ) {
      exactMatches++;
    }
  }

  const docCount = results.length;
  const fieldTotal = perField.reduce((n, f) => n + f.total, 0);
  const fieldCorrect = perField.reduce((n, f) => n + f.correct, 0);
  latencies.sort((a, b) => a - b);

  return {
    provider: results[0]?.provider ?? "rules",
    model: results[0]?.model ?? "unknown",
    docCount,
    parseRate: docCount === 0 ? 0 : parsed / docCount,
    fieldAccuracy: fieldTotal === 0 ? 0 : fieldCorrect / fieldTotal,
    exactMatchRate: docCount === 0 ? 0 : exactMatches / docCount,
    codeMatch: prf1(codeTp, codePredicted, codeActual),
    anomalyDetection: prf1(anomalyTp, anomalyPredicted, anomalyActual),
    latencyMsP50: percentileNearestRank(latencies, 50),
    latencyMsP95: percentileNearestRank(latencies, 95),
    totalCostUsd,
    costPerDocUsd: docCount === 0 ? 0 : totalCostUsd / docCount,
    egressBytesTotal,
    perField,
  };
}
