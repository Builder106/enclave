import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  seed: integer("seed").notNull(),
  idx: integer("idx").notNull(),
  split: text("split").notNull(),
  text: text("text").notNull(),
  truthJson: text("truth_json").notNull(),
  /** epoch ms */
  createdAt: integer("created_at").notNull(),
});

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  resultJson: text("result_json").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: real("cost_usd").notNull(),
  egressBytes: integer("egress_bytes").notNull(),
  error: text("error"),
  /** epoch ms */
  createdAt: integer("created_at").notNull(),
});

export const evalRuns = sqliteTable("eval_runs", {
  id: text("id").primaryKey(),
  seed: integer("seed").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  docCount: integer("doc_count").notNull(),
  metricsJson: text("metrics_json").notNull(),
  /** epoch ms */
  startedAt: integer("started_at").notNull(),
  /** epoch ms */
  finishedAt: integer("finished_at").notNull(),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  documentId: text("document_id"),
  detail: text("detail"),
  /** epoch ms */
  createdAt: integer("created_at").notNull(),
});
