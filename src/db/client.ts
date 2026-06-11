import { randomUUID } from "node:crypto";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { DEFAULTS } from "@/lib/contract";
import * as schema from "./schema";

let client: Client | null = null;
let db: LibSQLDatabase<typeof schema> | null = null;

function getClient(): Client {
  client ??= createClient({ url: process.env.ENCLAVE_DB_URL ?? DEFAULTS.dbUrl });
  return client;
}

export function getDb(): { db: LibSQLDatabase<typeof schema>; schema: typeof schema } {
  db ??= drizzle(getClient(), { schema });
  return { db, schema };
}

/** DDL mirror of schema.ts so scripts can run without a migration step. */
export async function ensureTables(): Promise<void> {
  await getClient().executeMultiple(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      seed INTEGER NOT NULL,
      idx INTEGER NOT NULL,
      split TEXT NOT NULL,
      text TEXT NOT NULL,
      truth_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      seed INTEGER NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      result_json TEXT NOT NULL,
      latency_ms INTEGER NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL,
      cost_usd REAL NOT NULL,
      egress_bytes INTEGER NOT NULL,
      error TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS eval_runs (
      id TEXT PRIMARY KEY,
      seed INTEGER NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      doc_count INTEGER NOT NULL,
      metrics_json TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      document_id TEXT,
      detail TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  // Legacy DBs predate runs.seed; every pre-existing row was seed 1.
  try {
    await getClient().execute("ALTER TABLE runs ADD COLUMN seed INTEGER");
    await getClient().execute("UPDATE runs SET seed = 1 WHERE seed IS NULL");
  } catch {
    // column already exists
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 12)}`;
}
