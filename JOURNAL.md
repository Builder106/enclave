# JOURNAL — Enclave

> Dated log of decisions, pivots, incidents, and quotes. Add entries as
> things happen — retrospectives need this raw material to land.
> Reverse-chronological; one paragraph max per entry.

## 2026-06-11 — Bedrock gate cleared; free-plan daily token quota blocks Trial 03 #incident

First Bedrock invoke from the new AWS account: auth via a Bedrock API key (`AWS_BEARER_TOKEN_BEDROCK` — no manual IAM user needed; the AI SDK provider reads it natively), Anthropic use-case gate passed, model reachable — then throttled with "Too many tokens per day" before a single document completed. New/free-plan accounts carry a tiny default daily token quota for Claude models, and the modern console has no per-model "request access" button to hint at any of this. The throttled 0% row was stripped from the measurement file rather than committed — a quota error is not a measurement. Trial 03 waits on a Service Quotas increase or the daily reset; ~65k tokens needed for the 50-doc run.

## 2026-06-11 — Trial 02 lands: the floor holds, the model wins on robustness #milestone

Full 50-doc local run (qwen2.5:3b via Ollama, 8 GB M1): 100% parse, 96.3% field accuracy, 36% exact match, code F1 81.0, anomaly F1 61.5, p50 23.6 s/doc, $0, 0 bytes egress. Two findings worth quoting: the 3B never fails to structure a document and beats the regex parser on field accuracy (96.3 vs 95.0) — but the deterministic floor wins everywhere else, at five orders of magnitude less latency. And the anomaly precision collapse (53%) is a *cascade*: misread charges flow into the deterministic sum check and raise false flags — the same perception-poisons-arithmetic pattern Helm measured on payout math, now reproduced at 3B scale. The zero-egress column is no longer a design claim; it's a measured number sitting next to the accuracy it costs.

## 2026-06-11 — llama.cpp grammars choke on regex patterns; one bad field must not void a document #incident #decision

Trial 02 first failed 50/50 with "response did not match schema": the model never saw our schema (the openai-compatible provider needs `supportsStructuredOutputs: true` to send it). With that flag, it failed differently — llama.cpp's schema→GBNF converter logged `failed to parse grammar` on our regex `pattern` fields and Ollama then generated *unconstrained*, echoing the document back. Two-part fix that's better measurement design anyway: a `LenientExtractionSchema` (no patterns/lengths) faces the model, and strict format rules moved out of the gate entirely — structural validity is grammar-enforced at generation; value errors (the 3B's empty `firstName`, a mangled MRN) are scored by the metrics as per-field misses instead of zeroing an otherwise-correct document. A grammar that enforces `MRN-\d{7}` would also have silently repaired OCR misreads for the model — removing it keeps the comparison honest. Post-fix probe: 100% parse, 97.2% field accuracy on 3 docs.

## 2026-06-11 — Homebrew's ollama formula ships without its inference engine #incident

The first local run errored 50/50 in ~11s/doc: `llama-server binary not found` across every path Ollama 0.30.7 (brew formula) checks. The API server ran, `ollama pull` worked — but the formula never installed the runner that actually executes models. Swapped to the official build (`brew uninstall ollama && brew install --cask ollama`); pulled weights survived in `~/.ollama/models`. The pipeline's error capture worked exactly as designed: per-doc errors landed in the `runs` table, which is where the diagnosis came from.

## 2026-06-10 — First measured run: the no-ML floor is high #milestone

Trial 01 (rules baseline, 50 held-out docs, seed 1) completed end-to-end: 96.0% parse, 95.0% field accuracy, 84.0% exact match, code F1 98.3%, anomaly F1 90.0%, p95 0.44 ms, $0, 0 bytes egress. Two honest readings recorded in the README: the floor is deliberately hard for the models to clear, and the code-match number is inflated by construction — synthetic line descriptions are drawn from the same dataset the matcher searches. Typecheck, 24 unit tests, and the production build all green in the same pass.

## 2026-06-10 — pnpm's build-script gate corrupts its own config #incident

`pnpm typecheck` started failing with an internal `runDepsStatusCheck` crash: something (likely an agent's `pnpm approve-builds` attempt mid-build) had written a literal placeholder block — `allowBuilds: { esbuild: set this to true or false }` — into `pnpm-workspace.yaml`, making every subsequent `pnpm install` exit 1, which the pre-run deps check then re-triggered on every script. Fix: rewrite the workspace yaml with only `onlyBuiltDependencies` + `verifyDepsBeforeRun: false`. Second find in the same pass: shadcn's init had silently failed to write `src/lib/utils.ts` (its install step had been dying on the same gate), so every UI component import was broken. Lesson: pnpm 10+'s script-approval UX fails non-interactively in ways that cascade; pin the workspace config before letting any tool touch it.

## 2026-06-10 — Built in Claude Code from commit zero #milestone

The entire scaffold — Next.js 16, AI SDK 5, Drizzle/libSQL, shadcn — stood up via Claude Code in a single session. The domain contract (`src/lib/contract.ts`) was authored first, deliberately, so that parallel build agents could compose against one authority instead of negotiating types with each other. Unlike MedCore, whose history predates this workflow, Enclave's commit history IS the AI-native-workflow evidence the Armada and AES postings explicitly ask for.

## 2026-06-10 — Mock provider pivots into a rules baseline #pivot

The planned "mock provider" — originally just a stand-in so the demo runs with zero infrastructure — became a deterministic regex/heuristic rules extractor that is itself a measured baseline. That turns the comparison into a three-way: rules vs. local vs. Bedrock. A no-ML baseline that both models must beat is a far stronger artifact than mock-vs-real; if a 3B local model can't clear a pile of regexes on field extraction, the chart says so honestly.

## 2026-06-10 — 8 GB M1 forces the 3B-class local model #decision

Hardware scout on the dev machine: 8 GB unified memory, no Ollama installed yet. An 8B Q4 model is too tight to run alongside Next dev + a browser, so the default local model is `qwen2.5:3b-instruct` — tool-capable, ~2 GB resident. 7B/8B is documented as the recommendation for ≥16 GB machines. This is an honest constraint, recorded in `DEFAULTS.localModel` with a comment rather than hidden behind an aspirational default that OOMs on first run.

## 2026-06-10 — Separate repo, harvest MedCore — don't merge #decision

Considered building Enclave inside the MedCore repo (the YAIS winner). Rejected: MedCore's 49-commit history predates the Claude-Code-native workflow claim this repo needs to make, and its Vite stack mismatches the Armada-aligned Next.js target. Instead, harvest the useful parts — the `fhir-mappers.ts` shapes and the audit-log pattern — and cross-link the two READMEs so each project points at the other.

## 2026-06-10 — Project inception — the third leg of AI_ML #decision #milestone

Enclave chosen as the third AI/ML portfolio project after mapping a cluster of internship postings — Armada Recovery, PPRG Holdings, TALD, Associated Environmental Systems. The repeated asks across all four: local LLMs, agentic systems, and AI-native build workflows. TradeTell covers retrieval; Helm covers orchestration and measurement of hosted models; Enclave covers the missing leg — local inference for documents where PHI legally can't go to a hosted API, with a measured rules/local/Bedrock comparison instead of vibes.
