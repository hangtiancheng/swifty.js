# swifty-eval

An LLM-as-Judge evaluation harness for task-instruction-following dialogue models. It simulates
multi-round phone conversations between built-in user personas and the model under test, then
scores each dialogue across eight weighted dimensions and produces explainable Markdown + HTML
reports.

This package is a TypeScript migration of the Python `ai-evaluate` project, with strict typing
(zod-validated boundaries) and several defect fixes (see [Migration notes](#migration-notes)).

## Features

- **Six user personas** — cooperative, adversarial, neutral, suspicious, busy, and unpredictable
  callers, each with numeric refusal/question tendencies wired into the simulator prompt
- **Eight weighted dimensions** — flow completion, constraint compliance, FAQ accuracy,
  naturalness, intent understanding, error recovery, coherence, and information completeness
- **Trimmed multi-sampling** — each dimension is judged N times; with three or more valid samples
  the highest and lowest are dropped before averaging
- **Separate judge model** — the scoring model can differ from the model under test to avoid
  self-evaluation bias; the judge also handles refusal detection
- **Bounded parallelism** — dimensions are evaluated concurrently with a configurable worker cap
- **Explainable reports** — every dimension ships its judge rationales; HTML reports include one
  radar chart per persona
- **OpenAI-compatible** — works with any OpenAI-compatible endpoint

## Quick start

```bash
pnpm install
pnpm build

# Evaluate the default task with every persona
node dist/main.js

# Specific task file and personas
node dist/main.js --task data/communicate.md --profiles 配合型用户 --profiles 对抗型用户
```

Set the API key either in `config.yaml` (`apiKey`) or via the `OPENAI_API_KEY` environment
variable (a local `.env` file is honored).

### CLI options

| Option       | Default               | Description                                |
| ------------ | --------------------- | ------------------------------------------ |
| `--task`     | `data/communicate.md` | Task instruction file                      |
| `--config`   | `config.yaml`         | Configuration file                         |
| `--profiles` | all personas          | Persona name; repeat the flag for multiple |
| `-h, --help` | —                     | Show usage                                 |

## Configuration

`config.yaml` uses camelCase keys and is validated with zod at startup:

```yaml
llm: # model under test + user simulator
  model: "..."
  apiBase: "https://your-endpoint/v1"
  apiKey: ""
  temperature: 0.7
  maxTokens: 500

evaluatorLlm: # judge model (optional; falls back to `llm`)
  model: "..."
  temperature: 0.3
  maxTokens: 1000

evaluation:
  evalCount: 3 # judge calls per dimension (>= 3 trims extremes)
  maxWorkers: 2 # concurrent dimension evaluations
  maxDialogueRounds: 30
  minDialogueRounds: 4 # refusal/termination detection activates after this
  weights: # must sum to 1.0
    flowCompletion: 0.30
    constraintCompliance: 0.20
    faqAccuracy: 0.15
    naturalness: 0.07
    intentUnderstanding: 0.07
    errorRecovery: 0.07
    coherence: 0.07
    infoCompleteness: 0.07

output:
  markdownPath: "output/evaluation_report.md"
  htmlPath: "output/evaluation_report.html"
```

Reports are written with a timestamp suffix, e.g. `output/evaluation_report_20260825_161730.md`.

## Task instruction format

Task files are Markdown documents structured by an LLM extraction step:

```markdown
# Role

...

# Task

...

# Opening Line

...supports ${placeholder} variables...

# Call Flow

1. ...

# Knowledge Points (FAQ)

- ...

# Constraints

- ...
```

See `data/communicate.md` for a complete example.

## Architecture

```
src/
├── main.ts                    # CLI entry
├── index.ts                   # public API
├── config.ts                  # zod-validated YAML configuration
├── models/                    # domain types (task, dialogue, evaluation)
├── llm/                       # ChatModel transport, OpenAI adapter, retrying client
├── parser/taskParser.ts       # LLM extraction -> zod-validated TaskInstruction
├── simulator/                 # personas + LLM user simulator
├── engine/                    # dialogue loop + state machine
├── evaluator/
│   ├── baseEvaluator.ts       # multi-sample judging with trimmed mean
│   ├── dimensions/            # the eight dimension evaluators
│   ├── registry.ts            # bounded-concurrency scheduling
│   └── scorer.ts              # weighted aggregation in canonical order
├── report/                    # Markdown + HTML generators
└── pipeline/                  # runEvaluation / generateReports orchestration
```

## Development

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest (82 tests)
pnpm check       # biome lint
pnpm build       # tsup (ESM + d.ts)
```

## Migration notes

Defects in the Python original that this migration fixes:

- **HTML report only rendered the first result's scores** — now every persona gets its own score
  card, dimension table, and radar chart
- **Failed judge calls silently scored 0.0** and poisoned averages — invalid samples are now
  excluded, with the failure surfaced in the report evidence
- **Judge JSON in Markdown fences failed to parse** — extraction now tolerates fences and prose
- **A final model reply was generated and discarded** when hitting the round cap — the loop no
  longer wastes that call
- **Refusal detection used the model under test as its own judge** — it now uses the judge model
- **Report dimension order was nondeterministic** (completion order) — now canonical
- **Persona probability fields were dead configuration** — now injected into simulator prompts
- **`${rider_name}` was the only supported placeholder** — placeholder resolution is generic
- **`sys.exit()` inside library code** — replaced with typed errors handled at the CLI boundary
- **Unescaped report interpolation** — HTML is escaped (XSS-safe) and Markdown table cells cannot
  break on `|` or newlines; the Chart.js CDN script is version-pinned with SRI
- **Output directory was only created for the Markdown path** — both report paths are ensured
