# agent-orchestra

Your portable development team: Lenka orchestrates specialized agents that turn
intent into verified behavior. Herdr is the persistent runtime; Codex, Claude
Code, and OpenCode have provider-neutral adapters behind the same team rules.

## What you get

- **Lenka** — the orchestrator persona. She turns each delegated outcome into
  a new one-run specialist, chooses the cheapest verified capable model, gives
  it the narrowest permission envelope, and requires evidence.
- **Audited permission envelopes** — explorer, implementer, verifier,
  browser-ops, task-manager, and the other installed definitions are reusable
  security boundaries, not a fixed workforce the human has to assemble.
- **Band teams** — domain teams with their own flow:
  - `dev` — dev-lead, dev-planner, dev-ticketer, dev-dag, dev-builder,
    dev-tester, dev-auditor (plan → Taskavel tickets → DAG → build → prove)
  - more teams (email, travel, finance...) follow the same template
- **Shared skills** — resend, email best practices, DNS, crash diagnosis, ...
  installed to the portable `~/.agents/skills` source location.

## Start on a new computer

The bootstrap detects the platform, installs an isolated Node.js runtime when
needed, installs Herdr, detects an authenticated harness, installs the team,
verifies a real model response, and opens Lenka directly inside a dedicated
`agent-orchestra` Herdr session.
It does not depend on Homebrew, Laravel Herd, a particular username, or a
machine-specific project directory.

After the first bootstrap, the same repository installs a small `lenka`
command into the user's local executable directory. From any project:

```sh
lenka up
lenka up codex
lenka up claude
lenka up opencode
lenka up --ask
lenka status
lenka doctor
```

`lenka up` auto-detects an authenticated harness. An explicit harness keeps
all routing inside that service. The conductor uses the verified `mid`
coordination model; one-run workers independently use economy, mid, or
strongest routes according to their capability profile. Each absolute project
path gets its own stable Herdr session, so opening one project can never attach
to another project's persisted panes.

Native Windows currently supports `lenka up` through OpenCode. Codex and
Claude selection through the Lenka command is implemented for macOS and Linux;
their complete orchestration behavior proof remains pending. Windows
multi-harness selection remains a later portability phase.

macOS or Linux:

```sh
git clone https://github.com/nezaboravi/agent-orchestra.git
cd agent-orchestra
./bootstrap.sh
```

Windows PowerShell:

```powershell
git clone https://github.com/nezaboravi/agent-orchestra.git
Set-Location agent-orchestra
.\bootstrap.ps1
```

The first command is intentionally safe on an already configured machine:
conflicting files stop the transaction before any write. Pass
`--conflict backup` on macOS/Linux or `-Conflict backup` on Windows only when
you explicitly want the old files preserved and replaced.

Credentials are never copied between tools. In automatic mode the Unix
bootstrap tries Codex with an existing ChatGPT sign-in, then Claude Code with
Haiku as its economical first route, then OpenCode providers such as Kimi. A harness is selected only after a minimal
live response succeeds. If none works, verification stops and asks the user to
sign in; it never claims READY from a model list alone.

Choose a harness explicitly when wanted:

```sh
./bootstrap.sh --harness codex
./bootstrap.sh --harness claude
./bootstrap.sh --harness opencode
```

Codex itself can also be launched directly from any project after bootstrap:

```sh
cd /path/to/project
codex
```

Codex loads Lenka from `AGENTS.md` and discovers the installed team in
`~/.codex/agents/`. A ChatGPT-authenticated Codex user does not need OpenCode,
DeepSeek, Kimi, or a Claude subscription for that path.

## Install into one project

macOS or Linux:

```sh
./bootstrap.sh --project /path/to/project --project-only
```

Windows PowerShell:

```powershell
.\bootstrap.ps1 -Project C:\path\to\project -ProjectOnly
```

Project-only mode leaves global agent and persona configuration untouched. It
also preserves an existing project `AGENTS.md`, including Laravel Boost rules.
It writes an ignored, credential-free routing map to
`.agent-orchestra/runtime/<harness>.json`. Lenka reads that single file before
delegation instead of scanning the project, global configuration, or provider
credentials. The map names the exact permission envelope and live model
selected for every factory profile on that machine.

## Inspect the installer manually

```sh
git clone https://github.com/nezaboravi/agent-orchestra
cd agent-orchestra
node orchestra.mjs doctor
node orchestra.mjs install --dry-run
node orchestra.mjs install --conflict backup
node orchestra.mjs doctor --installed
```

The doctor command checks Node.js, Herdr, the selected harness, agent definitions, and
permission invariants. The dry run shows every target before anything changes.
The explicit `backup` policy preserves replaced files and writes a recovery
manifest. By default, a conflict stops the entire installation before the first
write. Existing symbolic links are protected and never replaced, including
links to a user's canonical persona file.

Install into one project only when you ask for it:

```sh
node orchestra.mjs install --project /path/to/laravel-app --project-only --conflict backup
node orchestra.mjs doctor --project /path/to/laravel-app --project-only --installed
```

`--project-only` is the safe proof mode: it leaves the user's global persona,
agents, and shared skills untouched. If the project already has `AGENTS.md`
(for example, Laravel Boost guidelines), those instructions are preserved.
Its ignored recovery manifests stay inside `.agent-orchestra/` in that project.

Codex and Claude Code have authenticated adapter proofs; their complete
PLAN → BUILD → VERIFY → PROVE behavior proofs are still pending. OpenCode is
the original adapter. Cursor remains experimental and requires `--experimental`.

| Tool | Status | Agents (global) | Teams (explicit project install) | Persona |
|---|---|---|---|---|
| OpenCode | Supported | `~/.config/opencode/agents/*.md` | `.opencode/agents/` | `~/.config/opencode/AGENTS.md` |
| Claude Code | Authenticated adapter; full behavior proof pending | `~/.claude/agents/*.md` | `.claude/agents/` | `~/.claude/CLAUDE.md` |
| Codex | Authenticated adapter; full behavior proof pending | `~/.codex/agents/*.toml` | `.codex/agents/` | `~/.codex/AGENTS.md` |
| Cursor | Experimental | `~/.cursor/agents/*.md` | `.cursor/agents/` | `~/.cursor/rules/lenka.mdc` |

Shared skills are installed into `~/.agents/skills`. Project files are never
written merely because the installer was launched from that directory.

## Runtime

Start Herdr from a project. The bootstrap configures its pane to open the
verified harness automatically:

```sh
cd /path/to/project
herdr
```

The bootstrap derives a stable named session from the project's absolute path
and starts the selected harness with Lenka's instructions. Re-running it for
the same project reattaches to that project's persistent session; a different
project gets an independent session.
Herdr keeps the real terminal sessions alive and exposes agent state and
automation. It does not replace the selected harness; it gives the agent team
somewhere to run. Desktop clients remain optional.

The user's explicit instruction to start work authorizes normal agent dispatch.
The orchestra announces the selected roles and models, then continues without
another approval prompt. Destructive operations and external writes still stop
at a fresh human-approval boundary.

## Dynamic agent factory

The human describes the outcome; Lenka constructs the team. Before a
non-trivial delegation she creates an internal charter containing a one-run
agent name, one goal, the minimum capability profile, the cheapest live model
class capable of the work, forbidden adjacent actions, and required evidence.

The durable profiles in `orchestra.json` are permission envelopes. A new
specialist may use the read-only `explorer` envelope, for example, without
becoming "the explorer" as a permanent team member. Project and external
writes require a separate read-only proof. Unknown capabilities fail closed;
Lenka must never widen permissions merely to keep a workflow moving.

This distinction keeps the orchestra dynamic without asking a language model
to improvise security policy. Model routes remain adapter-specific and are
live-probed, so an unavailable or unauthorized provider falls through to the
next declared candidate.

## Configuration model

- **Rules are portable** — repository files are the source of truth.
- **Agents are generated safely** — nested permissions are parsed and checked;
  unverified adapters are opt-in.
- **Skills have one source** — adapters expose the shared location when their
  client supports it.
- **Models are adapter-specific** — Codex, Claude, and OpenCode never share
  credentials or model identifiers. Availability is checked with a real
  response, and actual usage is reported after the run.
- **Roles are ephemeral** — Lenka creates them for one outcome; reusable agent
  files provide tested permission envelopes rather than a fixed org chart.

## See also

- `docs/FORMATS.md` — the format map
- `docs/ARCHITECTURE.md` — Herdr/OpenCode layers and portability contract
- `docs/PORTABILITY.md` — platform support, verification levels, and test matrix
- `proofs/laravel-intent-proof.md` — the repeatable first Laravel acceptance task
