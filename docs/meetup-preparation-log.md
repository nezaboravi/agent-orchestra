# Laravel Serbia Meetup — Complete Preparation Log

**Date:** 2026-09-01 (work session spanning the evening of 2026-08-31 into 2026-09-01)
**Author:** Lenka (orchestrator), with Vladimir (CodingWisely)
**Purpose:** Complete, chronological record of how the "Agent Orchestration with
Laravel" meetup talk and its infrastructure were conceived, argued about, and
built. Read this end-to-end on another machine before the meetup.

> Note on timestamps: exact timestamps exist for tool-level events (noted where
> known). Conversation phases are ordered chronologically; relative times are
> approximate (evening 2026-08-31 → morning 2026-09-01).

---

## 0. Executive summary

What was built and decided in one working session:

1. **Talk materials** — talk plan, full spoken script (~27 min, English), Marp
   slides with Mermaid diagrams.
2. **Private repo `agentic-coding`** — 14 core agents with per-agent skill
   permissions, 7 skills, dev team (7 agents), Lenka model-dispatch protocol,
   talk plan + INSTALL docs + presentation copy.
3. **Public repo `agent-orchestra`** — open-source: 14 agents, dev team,
   shared skills, public Lenka persona (AGENTS.md), cross-platform installer
   (`install.mjs`, Node, Windows/macOS/Linux), format map docs.
4. **Autonomous archive run** — Lenka (headless) archived 245 pre-2026 Taskavel
   tasks in ~27 min for $0.16; the honest post-mortem of that run drove the
   team model.
5. **The team model ("band teams")** — domain teams (dev, email, travel,
   finance...) under one orchestrator; each team: lead + planner + executor +
   auditor, least privilege, plan → execute → verify → prove.
6. **Model dispatch protocol** — Lenka inventories available models, assigns
   per role (cheapest for volume, strongest for judgment), announces the plan
   and asks ONE confirmation, reports actual spend.
7. **Team bootstrap** — Lenka installs/creates teams herself; humans never
   copy agent files.
8. **`bandstand` project** — the Laravel website telling the story (built by
   Lenka in the session; diagnosis of what went wrong there → fixes).

---

## 1. Timeline of decisions (phase by phase)

| Phase | Topic | Key decision |
|---|---|---|
| 1 | Meetup request | Talk about "how I built agent orchestration"; English, 25–30 min, public repo |
| 2 | Talk content | Plan + full script + slides; conductor definition of development |
| 3 | Roster clarity | Stage names (Lenka, Atlas, Sage, Forge...) + what each agent DOES, models per agent |
| 4 | Skills | Skill map per agent; skills are provider-agnostic (`email-*`, `dns-*` wildcards) |
| 5 | Portability | Agents are templates; MCP/skills/models are the interchangeable parts |
| 6 | Autonomy | Headless runs exist in every tool (claude -p, codex exec, opencode run); new: codex --approve-for-me, Claude Managed Agents |
| 7 | Teams | Domain teams (bands) with own flow; never one agent + one model for a whole job |
| 8 | Installer | Cross-platform Node `install.mjs`; repo is source of truth (not npm) |
| 9 | Steps | `steps:` budget per role — coordinators 60, builders 40, mid 25–30, small stay small |
| 10 | bandstand build | Lenka built the website; diagnosis: no team used, no Taskavel project, no spend report, too many confirmations |
| 11 | Team bootstrap | Lenka creates missing teams herself; confirmations only for real decisions |

---

## 2. Phase 1 — The meetup request

Vladimir announced he needs a presentation for the **Laravel Serbia Meetup**
(upcoming Saturday): how he built agent orchestration — which agents, why, how.

Initial exploration verified the real state on the machine (no guessing):
- `~/.config/opencode/agents/` — 14 agents (lenka primary + 13 subagents)
- `~/.agents/skills/` — 6 skills
- `~/Work/machine-setup/` — the portable private setup repo
- `~/Work/trackavel` — Laravel app with `laravel/boost ^2.5.3` and a Laravel
  MCP server (`app/Mcp/Servers/TrackavelServer.php`) — used only as verified
  evidence of "Laravel as MCP server"; removed from the talk per Vladimir's
  wish (no real products on stage — generic example instead).

Decisions:
- Talk in **English**, slides in English, **25–30 minutes**.
- Format: story + live demo (Vladimir learns the script; slides later).
- Public repo at the end so attendees can take the setup home.

---

## 3. Phase 2 — Talk content: plan, script, slides

### 3.1 Talk plan (`laravel-meetup-agents.md`)
Two-part frame:
- **Part 1 — Theory (~12 min):** what development is today (the definition) →
  why an orchestra → the roster → three design principles → why Laravel is
  agentic-first (Boost, MCP, AI SDK).
- **Part 2 — Live demo (~17 min):** plan in Taskavel (via MCP) → `laravel new`
  → natural language → orchestra builds (explorer → implementer → verifier →
  reviewer) → Boost in action (search-docs, make:action, record-rule) → app
  becomes an MCP server (generic, live) → close the loop (tasks updated +
  handoff).
- Fallbacks: if Taskavel MCP fails on stage, skip plan/task-update parts; the
  story survives.

### 3.2 The definition (Vladimir's voice, option A recommended)
> "An orchestra conductor never plays an instrument — yet the music is theirs.
> That is the developer in the age of agents. I don't write every note anymore;
> I write the score: the architecture, the rules, the tests. The agents play
> the instruments. I own the music — and when a note is wrong, it's my ear
> that catches it."

Working definition: **development is the art of turning intent into verified
behavior.** Typing didn't disappear — it moved up the stack: intent, boundaries,
proof.

### 3.3 Full script (`laravel-meetup-script.md`)
Complete spoken script, minute by minute, with [DEMO] notes and recovery
notes (what to do if Taskavel MCP fails, `laravel new` fails, agent misbehaves,
running out of time).

### 3.4 Slides (`laravel-meetup-slides/`)
- Marp (Markdown → HTML/PDF), Mermaid diagrams (orchestra, demo flow).
- Verified free/open-source, works on macOS (Marp CLI via npm; Mermaid via
  mmdc).
- **Hard rule established (Vladimir, emphatic): NO EMOJI — ever, in any file,
  message, or diagram.** All emoji removed from slides and diagrams.
- Roster slide rewritten twice after feedback: titles were useless
  ("Surgeon — Escalator" explains nothing); every agent now has a **what-it-
  does** description ("Surgeon — deep debugging, last resort").

### 3.5 Verified quotes used in the talk
- Laravel docs: "Laravel is a framework for building modern web apps and AI
  agents."
- MCP: "the USB-C port for AI applications" (modelcontextprotocol.io).

---

## 4. Phase 3 — The roster: who, when, why, which model

Vladimir's critique: "Kimi-challenger? The fuck is that? vision? handoff?
Nigde nismo objasnili prave uloge — kada se trigeruju, kako i zašto, ko ih
trigeruje, koje modele koristim."

Resolution — every agent gets a stage name, a title, a job, a trigger, a model:

| Stage name (tech) | Job | Called when | Model |
|---|---|---|---|
| Lenka (lenka) | routes work, enforces verification | every task | Flash |
| Atlas (explorer) | maps the codebase, read-only | before a big change | Flash |
| Sage (docs-research) | docs & package versions | before writing new APIs | Flash |
| Forge (implementer) | writes code + tests | "build X" | Flash |
| Detective (debugger) | finds bug root causes | a test fails | Flash |
| Tally (verifier) | runs tests, cannot edit | after every change | Flash |
| Steward (task-manager) | Taskavel plans & tasks | plan, track, close work | Flash |
| Pixel (frontend-qa) | checks UI in browser, desktop + mobile | UI changed | Sol |
| Themis (reviewer) | independent code review | risky or large change | Sol |
| Surgeon (deep-debugger) | deep debugging, last resort | only after 3 failed attempts | Sol |
| Pilot (browser-ops) | production services in browser: deploys, DNS, email | browser operations | Sol |
| Iris (vision) | reads images & PDFs | when the model cannot see | Sol |
| Rival (kimi-challenger) | independent second opinion | only when explicitly asked | Kimi |
| Mnemo (handoff) | saves session state | end of every session | Flash |

Model strategy message: cost tied to the role, not to pride; design does NOT
depend on the model.

**Honest correction (from the autonomous run):** stage names exist only in the
talk. The real environment's agents are named explorer, implementer, etc. The
report must say so — no fiction.

---

## 5. Phase 4 — Skills: map, providers, configuration

### 5.1 Skill map (who may use what)
- `resend`, `resend-cli`, `email-best-practices` → Pilot (browser-ops)
- `diagnose-crash` → Detective + Surgeon
- `dsa-codebase-audit` → Themis
- `omarchy`, `customize-opencode` → Lenka
- everything else: `skill: deny` for every agent (least privilege)

Implemented as permission blocks in every agent file (OpenCode format).

### 5.2 Provider-agnostic skills
Vladimir's question: "kako će naš agent za DNS i emails znati da koristi
skills? možda korisnici koriste mailgun a ja resend, namecheap a ja cloudflare?"

Answer: **agents are provider-agnostic by permission** — Pilot allows any
skill matching `email-*`, `dns-*`, `resend*`, `email-best-practices`. Users
install skills for THEIR providers. Created `dns-cloudflare` skill (records,
proxy status, least-privilege API tokens, gotchas: no CNAME at apex, proxied
hides origin, deletes are irreversible).

### 5.3 Every agent is a configurable template
- MCP servers = interchangeable parts (Taskavel, Playwright, Context7, your
  tracker, your email/DNS providers)
- Skills = knowledge modules you install for your stack
- Models = one frontmatter line per agent
- The agent files themselves stay untouched when switching providers.

---

## 6. Phase 5 — Private repo `agentic-coding`

Created (PRIVATE, github.com/nezaboravi/agentic-coding):
- `agents/` — 14 agents with skill permissions
- `skills/` — 7 skills (incl. `dns-cloudflare`; fixed `diagnose-crash` symlink
  → real files)
- `teams/dev/` — dev team (7 agents)
- `docs/` — meetup talk plan, INSTALL guide
- `presentation/` — slides.html + diagrams
- README with roster + skill map + model strategy

Also: talk plan, HTML presentation, and INSTALL guide committed.

---

## 7. Phase 6 — Autonomy: the conversation that changed the design

Vladimir: "to nije automatizovan proces uopšte. ja moram da sedim ceo dan pred
ekranom i gledam. Anthropic je imao predavanja — pre su bili Loops a onda su
izmislili nešto novije pre mesec-dva."

Verified (web, official sources):
- **Claude Managed Agents** (2026-04-08): cloud-hosted agents, long-running
  autonomous sessions, scheduled execution, outcomes instead of instructions,
  multi-agent coordination.
- **Harness design for long-running development** (Anthropic engineering):
  planner → generator → evaluator; context resets + structured artifacts.
- **Codex `--approve-for-me`** (v0.147, 2026-08-07): an independent LLM
  reviewer approves low-risk tool calls; ~200× fewer human interruptions —
  unattended runs.
- **Headless in every tool** (verified): `claude -p` (with `--permission-mode
  auto`, `--output-format json`), `codex exec` (`--sandbox workspace-write`,
  `--ask-for-approval never`), `opencode run` (`--auto`, `--format json`),
  Gemini `-p --autonomous`.

**My mistake (Vladimir corrected me):** I presented automation tied to
opencode. The principle is tool-agnostic: same agents, same rules, any headless
CLI. DeepSeek/Kimi are MODEL providers, not tools (Kimi does have a CLI —
corrected later; not installed on this machine).

---

## 8. Phase 7 — The teams model ("band teams")

Vladimir: "ne želim da zakrpljavamo. Mi pravimo moj programerski bend. Ako
želim da uradim nešto na taskavelu, email prepisku, planiranje puta ili odora —
napravimo novi tim. Ima li smisla?" (Later: music is NOT the story — the story
is teams of agents for different purposes. The project name `bandstands` is
just the naming idea.)

The model:
```
LENKA — orchestrator (recognizes domain, calls team, or creates one on the fly)
├── DEV TEAM      (lead, planner, ticketer, dag, builder, tester, auditor)
├── EMAIL TEAM    (lead, copywriter, deliverability auditor, pilot)
├── TRAVEL TEAM   (lead, researcher, bookings, budgeter)
├── FINANCE TEAM  (lead, Xero/Mercury operators)
└── ... new teams on demand, always: least privilege, plan → execute → verify → prove
```

**Dev team created (7 agents, `teams/dev/`):**
- `dev-lead` — runs phases PLAN → BUILD → VERIFY → PROVE; cannot edit
- `dev-planner` — plan (steps, files, risks, verification criteria); cannot edit
- `dev-ticketer` — plan → Taskavel tasks (backlog/todo, dependencies, HTML
  descriptions); read-only except task creation
- `dev-dag` — builds dependency graph from tasks; dispatches builders in
  waves (independent branches parallel, dependent serialized); cannot write code
- `dev-builder` — implements; destructive commands denied
- `dev-tester` — writes/runs tests; may only edit test files
- `dev-auditor` — independent proof (tests, lint, diff vs plan); cannot change

Rules: one phase at a time; findings passed forward; 3 failed verify rounds →
escalation with structured packet; "no trust me — evidence only".

**Model dispatch protocol (Lenka):**
1. Inventory first — never assume (run `opencode models`, read config)
2. Assign per role: volume → cheapest; planning/mid → mid model; judgment →
   strongest
3. Announce plan + ask ONE confirmation before dispatch
4. Dispatch with approved models (create project-local agent with `model:`
   line if needed)
5. Report actual spend (agent, model, tokens, cost)

Verified inventory on this machine: 48 models, from free (ling-3.0-flash-fin-
free, mimo-v2.5-free, muse-spark, nemotron free) through cheap (deepseek-v4-
flash promo, glm-5.3-flash, qwen3.8-flash) to strong (gpt-5.6-sol, gpt-5.6-
terra, kimi-k3). **Claude Fable does NOT exist here** — Lenka must detect, not
assume.

---

## 9. Phase 8 — The autonomous archive run (the honest post-mortem)

Command: `opencode run --agent lenka --auto` — archive all pre-2026 Taskavel
tasks owned by vladimir@codingwisely.com, including subtasks, and produce a
morning report.

**Outcome (verified from session records):**
- 12 owned projects; 4 with zero pre-2026 tasks; **245 tasks archived**,
  20 already archived, 4 not found (never archived, honestly reported)
- 6 subtasks archived before parent; 24 checklist items completed to unblock
- ~27 min 44 s; **$0.162**; 4.78M tokens (4.46M cache); agent: lenka +
  task-manager, all on deepseek-v4-flash
- Report: `~/Desktop/taskavel-archive-report.md` (+ HTML)

**Vladimir's critique (right):** "zašto lenka ne daje nalog task manageru the
planner? šta je planirao? on je išao direktno u egzekuciju. gde je dokaz da je
urađeno? zašto executor nije koristio najjeftiniji model?" — The run had:
- NO planning phase
- NO independent verification (same agent executed and verified itself)
- NO model economy (one model for everything)
- NO audit role

This is exactly what the team model fixes architecturally. Honest talk line:
"my first autonomous run showed me where orchestration doesn't work — nobody
reviewed the plan, nobody independently verified. That's why the system now
has planning, an auditor, and a judge."

---

## 10. Phase 9 — Formats, installer, public repo

### 10.1 Agent formats differ per tool (verified)
| Tool | Agents | Persona |
|---|---|---|
| OpenCode | `~/.config/opencode/agents/*.md` (frontmatter: permission) | AGENTS.md |
| Claude Code | `~/.claude/agents/*.md` (tools allowlist, name required) | CLAUDE.md |
| Codex | `~/.codex/agents/*.toml` (developer_instructions, sandbox_mode) | AGENTS.md |
| Cursor | `~/.cursor/agents/*.md` + `.cursor/rules` + skills | rules `.mdc` |
| Kimi / Gemini / Aider | rules only (no subagent manifests) | AGENTS.md |
| DeepSeek | model provider — not a tool | — |

Skills are shared: `~/.agents/skills` is read by every tool.

### 10.2 Installer: Node, not bash
Vladimir: "kako će install.sh raditi na Windows?!" — Correct: `install.mjs`
(Node, no dependencies, cross-platform). No npm package for now: the repo is
the single source of truth; npm would be a second copy that drifts.

### 10.3 Public repo `agent-orchestra` (github.com/nezaboravi/agent-orchestra)
- `agents/` (14), `teams/dev/` (7), `skills/` (7 — incl. provider skills and
  omarchy, kept per Vladimir: "to su skillovi provajdera... meni je korisno"),
  `AGENTS.md` (public Lenka persona, scrubbed — no health data, no personal
  info), `install.mjs`, `docs/FORMATS.md`, README.
- Tested on isolated HOME: detects opencode/claude/codex/cursor/gemini;
  14 valid Codex TOMLs; conversions verified.
- `.gitignore` for generated `.opencode/`, `.claude/`, `.codex/`, `.cursor/`.

### 10.4 Steps budget per role (after "Maximum steps reached" failures)
| Role | steps |
|---|---|
| lenka, dev-lead (coordinators) | 60 |
| dev-builder | 40 |
| browser-ops | 45 |
| frontend-qa | 36 |
| task-manager | 30 (was 10 — the culprit) |
| dev-tester, dev-auditor | 30 |
| implementer | 27 |
| dev-planner, dev-ticketer, dev-dag | 25 |
| debugger, kimi-challenger | 22 |
| deep-debugger | 33 |
| verifier | 18 |
| reviewer | 15 |
| explorer, docs-research | 12 |
| handoff | 8 |
| vision | 6 |

---

## 11. Phase 10 — `bandstand` build and diagnosis

Vladimir created the Laravel project (`~/Work/bandstand`) and ran the new
session with a full briefing prompt. Lenka built the entire website:
- Public layout matching the starter kit's design system (verified),
  pages: Home, Concept, Roster, Teams, Principles, Dispatch, Demo, Start
- Fixed a real bug (array_intersect_key), wrote feature tests
- **Verification: 41 tests, 98 assertions, Pint clean; real browser check
  (Playwright) — found 2 mobile overflow bugs, fixed, re-verified: 0 console
  errors, 0 overflows**
- Two clean commits; server live on http://127.0.0.1:8899

**Vladimir's (correct) complaints:**
1. "Ne vidim novi projekat u Taskavelu" — the dev-ticketer was never invoked:
   the dev team was NOT installed in the project (`.opencode/agents/` absent)
   and Taskavel MCP was not configured there. Lenka did everything herself:
   271 bash calls, one agent, one model (deepseek-v4-flash) — the exact trap.
2. No model/cost report at the end (protocol step 5 skipped).
3. Interrupted 2–3 times asking for input — confirmations for routine steps
   (git init, layout, deploy target). One confirmation per job is the norm.
4. No visible proof summary.

**Fixes applied:**
- `install.mjs`: teams now install GLOBALLY (exist in every project)
- Lenka prompt: **Team bootstrap** — she checks for the team, creates it
  herself (copy from local agent-orchestra clone, or clone, or generate from
  template), announces briefly WITHOUT asking; asks for confirmation only for
  real decisions (budget/model plan, destructive, ambiguity)
- Vladimir's answer to "who installs?": nobody human. `node install.mjs` once;
  Lenka maintains teams from then on.

---

## 12. Phase 11 — Final state and rules (last conclusions)

### 12.1 Where things live
| Asset | Location |
|---|---|
| Talk plan | `~/Work/laravel-meetup-agents.md` |
| Full script | `~/Work/laravel-meetup-script.md` |
| Slides | `~/Work/laravel-meetup-slides/` (Marp + Mermaid) |
| Private agents | github.com/nezaboravi/agentic-coding (PRIVATE) |
| Public agents + installer | github.com/nezaboravi/agent-orchestra (PUBLIC) |
| Portable private setup | github.com/nezaboravi/machine-setup (PRIVATE) |
| Story website | `~/Work/bandstand` (Laravel, live on :8899) |
| Archive run report | `~/Desktop/taskavel-archive-report.md` (+ HTML) |
| Handoff | `~/Work/HANDOFF.md` |

### 12.2 Standing rules (final)
1. **No emoji. Ever.** In files, messages, diagrams, code.
2. Written deliverables in English (talk, slides, commits, docs).
3. Never guess: verify from code/data/logs before claiming.
4. Least privilege: subagents get nothing by default.
5. Verification in the flow: nobody says done without proof; 3 failed attempts
   → escalation.
6. Teams: domain teams with own flow; never one agent + one model for a whole
   job.
7. Model dispatch: inventory → assign per role → announce + ONE confirmation →
   dispatch → report actual spend.
8. Team bootstrap: Lenka creates missing teams herself.
9. Steps per role: coordinators 60, builders 40, mid 25–30, small stay small.
10. Skills are provider-agnostic (`email-*`, `dns-*`); users install their own.
11. Installer is cross-platform Node; repo is the single source of truth.
12. Handoff at the end of every session (project-local).

### 12.3 Open items
- Kimi CLI agent format unverified (not installed on this machine) — rules-only
  until verified on a machine with kimi.
- Final slides rebuild after roster/team changes (deck still shows the older
  orchestra diagram).
- Vision subagent hitting token-refresh 401 on this machine — visual checks
  were done manually.
- bandstand: dev team to be bootstrapped by Lenka in the project + Taskavel
  MCP configured there; next run must follow the full team flow (planner →
  ticketer → Taskavel project → dag → builders → tester → auditor → report).
- Public repo naming for the website: `bandstands` (GitHub) per Vladimir.

---

## 13. Key quotes (verbatim, for the talk and the record)

- "Orchestra conductor never plays an instrument, yet the music is theirs."
- "Development is the art of turning intent into verified behavior."
- "Cost is tied to the role, not to pride."
- "No trust me — evidence only."
- "The first autonomous run showed me where orchestration doesn't work —
  nobody reviewed the plan, nobody independently verified."
- "Keep your editor — the orchestra follows you."
- "I no longer type every line; I type intent, boundaries, and proof."
- "If the team doesn't exist, Lenka creates it — with least privilege,
  plan → execute → verify → prove."