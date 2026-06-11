// Relative imports: tsx does not resolve the "@" path alias.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  PROVIDERS,
  type DocumentRunResult,
  type EvalMetrics,
  type GeneratedDocument,
  type MeasurementFile,
  type PRF1,
  type Provider,
} from "../src/lib/contract";
import { generateBatch } from "../src/generators";
import { runDocument } from "../src/agent/run";
import { computeMetrics } from "../src/eval/metrics";
import { audit } from "../src/db/audit";
import { ensureTables, getDb, newId } from "../src/db/client";
import { evalRuns, runs } from "../src/db/schema";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional
}

function parseFlags(argv: string[]): Map<string, string> {
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      flags.set(arg.slice(2), "");
    } else {
      flags.set(arg.slice(2), value);
      i++;
    }
  }
  return flags;
}

function intFlag(flags: Map<string, string>, name: string, fallback: number): number {
  const raw = flags.get(name);
  if (raw === undefined) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`--${name} must be a non-negative integer, got "${raw}"`);
  }
  return n;
}

interface BatchFile {
  seed: number;
  generatedAt: string;
  docs: GeneratedDocument[];
}

function loadOrGenerateBatch(seed: number): GeneratedDocument[] {
  const file = path.join(process.cwd(), "data", "documents", `seed-${seed}.json`);
  if (existsSync(file)) {
    return (JSON.parse(readFileSync(file, "utf8")) as BatchFile).docs;
  }
  const docs = generateBatch(seed);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ seed, generatedAt: new Date().toISOString(), docs }, null, 2));
  console.log(`No batch file for seed ${seed}; generated ${docs.length} docs and wrote ${file}`);
  return docs;
}

const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;
const prf = (p: PRF1): string => `P ${pct(p.precision)}  R ${pct(p.recall)}  F1 ${pct(p.f1)}`;

function printMetrics(metrics: EvalMetrics, seed: number): void {
  console.log("");
  console.log(`── ${metrics.provider} · ${metrics.model} · seed ${seed} ──`);
  console.log(`docs             ${metrics.docCount}`);
  console.log(`parse rate       ${pct(metrics.parseRate)}`);
  console.log(`field accuracy   ${pct(metrics.fieldAccuracy)}`);
  console.log(`exact match      ${pct(metrics.exactMatchRate)}`);
  console.log(`code match       ${prf(metrics.codeMatch)}`);
  console.log(`anomaly detect   ${prf(metrics.anomalyDetection)}`);
  console.log(`latency p50/p95  ${metrics.latencyMsP50.toFixed(2)} / ${metrics.latencyMsP95.toFixed(2)} ms`);
  console.log(`cost total       $${metrics.totalCostUsd.toFixed(6)}`);
  console.log(`cost per doc     $${metrics.costPerDocUsd.toFixed(6)}`);
  console.log(`egress total     ${metrics.egressBytesTotal} bytes`);
  console.log("per-field:");
  for (const f of metrics.perField) {
    console.log(`  ${f.field.padEnd(24)} ${f.correct}/${f.total}  ${pct(f.total === 0 ? 0 : f.correct / f.total)}`);
  }
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const seed = intFlag(flags, "seed", 1);
  const providerRaw = flags.get("provider");
  if (providerRaw === undefined || !(PROVIDERS as readonly string[]).includes(providerRaw)) {
    throw new Error(`--provider is required and must be one of: ${PROVIDERS.join(" | ")}`);
  }
  const provider = providerRaw as Provider;
  const model = flags.get("model");
  const count = flags.has("count") ? intFlag(flags, "count", 0) : undefined;

  const docs = loadOrGenerateBatch(seed);
  let evalDocs = docs.filter((d) => d.split === "eval");
  if (count !== undefined) evalDocs = evalDocs.slice(0, count);
  if (evalDocs.length === 0) throw new Error(`no eval documents for seed ${seed}`);

  await ensureTables();
  const { db } = getDb();
  const startedAt = Date.now();
  await audit({
    actor: "cli",
    action: "measure_start",
    detail: `seed=${seed} provider=${provider} docs=${evalDocs.length}`,
  });

  console.log(`Measuring ${provider} on ${evalDocs.length} eval docs (seed ${seed})`);
  const results: DocumentRunResult[] = [];
  // Sequential on purpose: local models share one machine's compute budget.
  for (let i = 0; i < evalDocs.length; i++) {
    const doc = evalDocs[i];
    const result = await runDocument(
      { id: doc.id, text: doc.text },
      model !== undefined ? { provider, model } : { provider },
    );
    results.push(result);
    await db.insert(runs).values({
      id: newId("RUN"),
      documentId: result.documentId,
      provider: result.provider,
      model: result.model,
      resultJson: JSON.stringify(result),
      latencyMs: result.latencyMs,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      costUsd: result.costUsd,
      egressBytes: result.egressBytes,
      error: result.error,
      createdAt: Date.now(),
    });
    if ((i + 1) % 10 === 0 || i + 1 === evalDocs.length) {
      const errors = results.filter((r) => r.error !== null).length;
      console.log(`  [${i + 1}/${evalDocs.length}] last=${doc.id} ${result.latencyMs}ms errors=${errors}`);
    }
  }

  const metrics = computeMetrics(evalDocs, results);

  const measurePath = path.join(process.cwd(), "data", "measurements", `seed-${seed}.json`);
  let otherResults: EvalMetrics[] = [];
  if (existsSync(measurePath)) {
    const prev = JSON.parse(readFileSync(measurePath, "utf8")) as MeasurementFile;
    otherResults = prev.results.filter((r) => r.provider !== provider);
  }
  const measurement: MeasurementFile = {
    version: 1,
    seed,
    split: "eval",
    docCount: evalDocs.length,
    generatedAt: new Date().toISOString(),
    results: [...otherResults, metrics],
  };
  mkdirSync(path.dirname(measurePath), { recursive: true });
  writeFileSync(measurePath, JSON.stringify(measurement, null, 2));

  await db.insert(evalRuns).values({
    id: newId("EVAL"),
    seed,
    provider,
    model: metrics.model,
    docCount: metrics.docCount,
    metricsJson: JSON.stringify(metrics),
    startedAt,
    finishedAt: Date.now(),
  });
  await audit({
    actor: "cli",
    action: "measure_finish",
    detail: `seed=${seed} provider=${provider} docs=${metrics.docCount} fieldAcc=${metrics.fieldAccuracy.toFixed(3)}`,
  });

  printMetrics(metrics, seed);
  console.log(`\nwrote ${measurePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
