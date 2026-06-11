<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img alt="Enclave — clinical document AI that never phones home" src="assets/banner-dark.svg">
</picture>

[![CI](https://github.com/Builder106/Enclave/actions/workflows/ci.yml/badge.svg)](https://github.com/Builder106/Enclave/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/Node-22%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![AI SDK](https://img.shields.io/badge/AI%20SDK-5-0A0A0A.svg)](https://ai-sdk.dev/)
[![PHI egress](https://img.shields.io/badge/PHI%20egress-0%20bytes%20(local%20path)-success.svg)](#the-three-provider-design)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

> **Enclave is a local-first agentic pipeline for clinical/billing documents.** OCR-noisy superbills go in; structured records come out — extraction → ICD-10/CPT code matching → anomaly flagging — running entirely on-device via Ollama, with AWS Bedrock as the metered hosted baseline and a deterministic rules parser as the no-ML floor. PHI never leaves the machine on the local path, and the eval harness *proves* it: egress bytes are a first-class metric, measured per run, rendered on the dashboard next to accuracy and cost.

## The headline findings

**Trial 01 — Rules baseline · 50 held-out synthetic superbills · deterministic parser, no model**

> **96.0% parse rate, 95.0% field accuracy, 84.0% exact match, code-match F1 98.3% (P 100 / R 96.7), anomaly-detection F1 90.0% (P 100 / R 81.8) — at 0.15 ms p50 / 0.44 ms p95, $0, and 0 bytes of PHI egress.** The no-ML floor is deliberately high: a regex-and-heuristics parser over OCR-noisy text sets the bar both models have to clear before their latency and cost are worth paying. Reproduce: `pnpm generate --seed 1 && pnpm measure --provider rules --seed 1`.

**Trials 02 & 03 — pending, honestly.** The local (`qwen2.5:3b-instruct` — the dev machine is an 8 GB M1, so a 3B-class model is the honest pick; use 7B/8B on ≥16 GB) and Bedrock runs have not been executed yet. No numbers will appear here until they have. To produce them:

```bash
# Trial 02 — local, zero egress
ollama pull qwen2.5:3b-instruct
pnpm measure --provider local --seed 1

# Trial 03 — hosted baseline, metered egress
export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... AWS_REGION=us-east-1
pnpm measure --provider bedrock --seed 1
```

**A caveat the numbers need:** the synthetic generator draws service-line descriptions from the *same* code dataset the matcher searches (verbatim or via synonyms), so code-matching is materially easier here than against free-text from real clinicians. The rules baseline's 98.3% code F1 should be read as a ceiling-calibration of the harness, not a claim about real-world coding. See [docs/BRIEF.md](docs/BRIEF.md) for the full design rationale.

## How it works

```mermaid
sequenceDiagram
    autonumber
    participant CLI as CLI (pnpm measure)
    participant Agent as Agent loop (src/agent)
    participant R as Rules parser
    participant L as Ollama (localhost)
    participant B as AWS Bedrock
    participant Det as resolveCodes / detectAnomalies (deterministic)
    participant DB as libSQL + audit log
    participant Dash as Dashboard (Next.js)

    CLI->>Agent: runDocument(noisy superbill text)
    alt provider = rules
        Agent->>R: parse (regex + heuristics)
    else provider = local
        Agent->>L: generateObject(ExtractionSchema)
    else provider = bedrock
        Agent->>B: generateObject(ExtractionSchema)
        Note over Agent,B: the only path where document bytes<br/>leave the machine — metered as egressBytes
    end
    Agent->>Det: extraction → code matching → anomaly checks
    Det-->>Agent: resolved record + flags
    Agent->>DB: runs row + audit entry
    CLI->>DB: eval_runs + measurement JSON
    Dash->>DB: render seed-1.json side-by-side
```

The model is used for the *perception* step only — messy text to structured fields. Code matching and anomaly detection are deterministic TypeScript: the model proposes, the code disposes. That split is the architecture (a lesson carried over from [Helm](https://github.com/Builder106/Helm)'s payout-reconciler finding, where an LLM that read invoices at 91.9% dropped to 54% on multi-step policy math).

## The three-provider design

| Provider | What it is | Marginal cost | Where document bytes go |
|---|---|---|---|
| `rules` | Deterministic regex/heuristic parser — the no-ML floor | $0 | Nowhere. In-process. |
| `local` | Open-weights model via Ollama (`qwen2.5:3b-instruct` default) | $0 | `localhost:11434`. Never off-machine. |
| `bedrock` | Claude on AWS Bedrock — the hosted ceiling | per-token (metered) | AWS. Counted byte-for-byte as `egressBytes`. |

Same agent loop, same eval split, same metrics — the provider is a one-line swap through the AI SDK. The comparison the dashboard renders is the product: *is a 3B model running where the PHI lives good enough to skip the cloud?*

## Built end-to-end in Claude Code

Every line of this repo — scaffold, domain contract, generator, agent loop, eval harness, dashboard, tests, this README — was written via Claude Code, from commit zero. The workflow was contract-first: [`src/lib/contract.ts`](src/lib/contract.ts) was authored before any module, then parallel agents built generator / DB / providers / agent-loop / eval / dashboard against it, then an integration pass drove typecheck, 24 unit tests, an end-to-end measured run, and a production build to green. The commit history is the receipt; decisions and incidents are logged as they happened in [JOURNAL.md](JOURNAL.md).

## Quickstart

```bash
pnpm install
cp .env.example .env

pnpm generate --seed 1               # 60 synthetic superbills (50 eval / 10 dev)
pnpm measure --provider rules --seed 1   # the no-ML baseline, runs anywhere
pnpm dev                             # dashboard at localhost:3000
pnpm test                            # vitest suite
```

For the local model path install [Ollama](https://ollama.com), then `ollama pull qwen2.5:3b-instruct` and `pnpm measure --provider local`. For Bedrock, set the AWS env vars in `.env` (see `.env.example`) — credentials are only touched by the bedrock provider.

## Project structure

```
src/lib/contract.ts    ← the authority: domain types, Zod schemas, metrics, defaults
src/lib/codes/         ICD-10-CM + CPT datasets with synonyms and typical fees
src/generators/        seeded superbill generator + OCR-noise renderer
src/agent/             rules parser · LLM extraction · code matching · anomaly checks · runDocument
src/eval/              metrics (field accuracy, PRF1, percentiles)
scripts/               generate.ts · measure.ts (CLI, tsx)
src/db/                Drizzle schema, libSQL client, audit log
src/app/               dashboard (Next.js App Router) + /api/measurements
data/measurements/     measured JSON — the dashboard's single source of truth
```

## Provenance & lineage

Enclave is the AI-layer sequel to [MedCore](https://github.com/Builder106/MedCore) (winner, 2026 Yale Africa Innovation Symposium), which made the case that clinics in low-connectivity settings need offline-first records. Enclave extends the thesis to the intelligence layer: if the records can't depend on the cloud, neither should the model reading them. The FHIR R4 resource shapes and the audit-log pattern are harvested directly from MedCore's server. Within the wider portfolio: [TradeTell](https://github.com/Builder106/IMC_Prosperity) covers retrieval, [Helm](https://github.com/Builder106/Helm) covers orchestration and measurement of hosted models, Enclave covers local inference where hosted models legally can't go.

## Roadmap

- **Trials 02/03** — run the local and Bedrock measurements; publish all three columns.
- **LoRA adaptation** — fine-tune the 3B extractor on generator output to close any parity gap with the hosted baseline.
- **Image ingestion** — rasterized superbills through a local vision model (or docTR), replacing the text-noise proxy.
- **Azure SQL target** — swap libSQL for Azure SQL via the Drizzle layer (schema is already dialect-conservative).

## License

MIT — see [LICENSE](LICENSE).
