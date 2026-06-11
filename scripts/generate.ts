// Relative imports: tsx does not resolve the "@" path alias.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { DEFAULTS } from "../src/lib/contract";
import { generateBatch } from "../src/generators";
import { audit } from "../src/db/audit";
import { ensureTables, getDb } from "../src/db/client";
import { documents } from "../src/db/schema";

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

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const seed = intFlag(flags, "seed", 1);
  const evalCount = intFlag(flags, "eval", DEFAULTS.evalDocCount);
  const devCount = intFlag(flags, "dev", DEFAULTS.devDocCount);

  const docs = generateBatch(seed, { evalCount, devCount });

  const outDir = path.join(process.cwd(), "data", "documents");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `seed-${seed}.json`);
  writeFileSync(outPath, JSON.stringify({ seed, generatedAt: new Date().toISOString(), docs }, null, 2));

  await ensureTables();
  const { db } = getDb();
  await db.delete(documents).where(eq(documents.seed, seed));
  // Document ids are batch-local (DOC-00001…), so a different seed may already
  // own the same primary keys — clear those too before inserting.
  await db.delete(documents).where(inArray(documents.id, docs.map((d) => d.id)));

  const now = Date.now();
  const rows = docs.map((doc) => ({
    id: doc.id,
    seed: doc.seed,
    idx: doc.index,
    split: doc.split,
    text: doc.text,
    truthJson: JSON.stringify(doc.truth),
    createdAt: now,
  }));
  for (let i = 0; i < rows.length; i += 50) {
    await db.insert(documents).values(rows.slice(i, i + 50));
  }

  await audit({ actor: "cli", action: "generate", detail: `seed=${seed} count=${docs.length}` });

  const evalDocs = docs.filter((d) => d.split === "eval").length;
  const anomalous = docs.filter((d) => d.truth.injectedAnomalies.length > 0).length;
  // renderClean prints "[<icd10>]" after every diagnosis iff codes are shown.
  const printedCodes = docs.filter((d) => d.cleanText.includes(`[${d.truth.diagnoses[0].icd10}]`)).length;

  console.log(`Generated ${docs.length} documents for seed ${seed}`);
  console.log(`  splits: eval=${evalDocs} dev=${docs.length - evalDocs}`);
  console.log(`  docs with injected anomalies: ${anomalous}`);
  console.log(`  docs with printed codes: ${printedCodes}`);
  console.log(`  wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
