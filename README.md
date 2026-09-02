# agent-orchestra

Your portable development team: Lenka orchestrates specialized agents that turn
intent into verified behavior. `lenka up` launches Codex, Claude Code, Kimi
Code, or OpenCode directly. Herdr is an optional persistent workspace, not a
dependency of the orchestra.

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

## Install on any computer

The bootstrap detects the platform, installs an isolated Node.js runtime when
needed, detects an authenticated harness, installs the team, verifies a real
model response, and opens Lenka directly in the selected CLI. Herdr is installed
only when `--herdr` is requested.
It does not depend on Homebrew, Laravel Herd, a particular username, or a
machine-specific project directory.

The installed Lenka CLI is a standalone package under the user's local
directory. It is deliberately not linked to the cloned repository, so the
command continues to work if the clone lives in a protected folder, is moved,
or is removed later.

### macOS

```sh
git clone https://github.com/nezaboravi/agent-orchestra.git
cd agent-orchestra
./bootstrap.sh
```

### Linux, including Omarchy

```sh
git clone https://github.com/nezaboravi/agent-orchestra.git
cd agent-orchestra
./bootstrap.sh
```

### Windows PowerShell

```powershell
git clone https://github.com/nezaboravi/agent-orchestra.git
Set-Location agent-orchestra
.\bootstrap.ps1
```

On an existing installation, pull the repository and run the same bootstrap
command again. It replaces the installed package from a fresh local archive;
it never leaves the CLI pointing back at the checkout.

After installation, enter any project and start Lenka. These absolute command
paths also work when the local executable directory is not on `PATH`:

macOS or Linux:

```sh
cd /path/to/project
"$HOME/.local/bin/lenka" up
```

Windows PowerShell:

```powershell
Set-Location C:\path\to\project
& "$HOME\.local\lenka.cmd" up
```

After the first bootstrap, the same repository installs a small `lenka`
command into the user's local executable directory. When that directory is on
`PATH`, the shorter commands are available from any project:

```sh
lenka up
lenka up codex
lenka up claude
lenka up kimi
lenka up opencode
lenka up opencode --herdr
lenka up --ask
lenka status
lenka doctor
```

`lenka up` auto-detects an authenticated harness. An explicit harness keeps
all routing inside that service. The conductor uses the verified `mid`
coordination model; one-run workers independently use economy, mid, or
strongest routes according to their capability profile. The default path opens
that CLI directly. If `--herdr` is added, each absolute project path gets its
own stable Herdr session.

Codex launches are deterministic in both dimensions: the verified model and
the reasoning effort are pinned by the orchestra. Coordination, planning, and
normal implementation use `medium`; economy workers use `low`; final audit
uses `high`. A previous Codex session or machine-wide default cannot silently
turn an ordinary run into a high-reasoning run.

Native Windows currently supports `lenka up` through OpenCode. Codex and
Claude selection through the Lenka command is implemented for macOS and Linux;
their complete orchestration behavior proof remains pending. Windows
multi-harness selection remains a later portability phase.

The first command is intentionally safe on an already configured machine:
conflicting files stop the transaction before any write. Pass
`--conflict backup` on macOS/Linux or `-Conflict backup` on Windows only when
you explicitly want the old files preserved and replaced.

Credentials are never copied between tools. In automatic mode the Unix
bootstrap tries Codex with an existing ChatGPT sign-in, then Claude Code with
Haiku as its economical first route, then Kimi Code, then OpenCode. A harness
is selected only after a minimal live response succeeds. If none works,
verification stops and asks the user to sign in; it never claims READY from a
model list alone.

Choose a harness explicitly when wanted:

```sh
./bootstrap.sh --harness codex
./bootstrap.sh --harness claude
./bootstrap.sh --harness kimi
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
For Codex, it also records the exact reasoning effort for the conductor and
every dynamic permission profile.

## Inspect the installer manually

```sh
git clone https://github.com/nezaboravi/agent-orchestra
cd agent-orchestra
node orchestra.mjs doctor
node orchestra.mjs install --dry-run
node orchestra.mjs install --conflict backup
node orchestra.mjs doctor --installed
```

The doctor command checks Node.js, the selected harness, agent definitions, and
permission invariants; it reports Herdr only as an optional tool. The dry run shows every target before anything changes.
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
the original adapter. Kimi Code has an authenticated direct-adapter proof; its
complete behavior proof is still pending. Cursor remains experimental and
requires `--experimental`.

| Tool | Status | Agents (global) | Teams (explicit project install) | Persona |
|---|---|---|---|---|
| OpenCode | Supported | `~/.config/opencode/agents/*.md` | `.opencode/agents/` | `~/.config/opencode/AGENTS.md` |
| Claude Code | Authenticated adapter; full behavior proof pending | `~/.claude/agents/*.md` | `.claude/agents/` | `~/.claude/CLAUDE.md` |
| Codex | Authenticated adapter; full behavior proof pending | `~/.codex/agents/*.toml` | `.codex/agents/` | `~/.codex/AGENTS.md` |
| Kimi Code | Authenticated direct adapter; full behavior proof pending | `~/.kimi-code/agents/*.md` | `.kimi-code/agents/` | `~/.kimi-code/AGENTS.md` |
| Cursor | Experimental | `~/.cursor/agents/*.md` | `.cursor/agents/` | `~/.cursor/rules/lenka.mdc` |

Shared skills are installed into `~/.agents/skills`. Project files are never
written merely because the installer was launched from that directory.

## Direct runtime and optional Herdr

The normal path starts Lenka in the chosen CLI without Herdr:

```sh
cd /path/to/project
lenka up codex
```

Use Herdr only when persistent panes are useful:

```sh
lenka up opencode --herdr
```

That optional path derives a stable session name from the absolute project
path, so different projects cannot attach to the same persisted panes. Herdr
does not choose the model or perform orchestration; the selected CLI still
does that work. Desktop clients remain optional.

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
- **Models are adapter-specific** — Codex, Claude, Kimi, and OpenCode never
  share credentials or model identifiers. Availability is checked with a real
  response, and actual usage is reported after the run. Without a configured
  Kimi subagent model pool, Kimi workers inherit its verified configured model.
- **Roles are ephemeral** — Lenka creates them for one outcome; reusable agent
  files provide tested permission envelopes rather than a fixed org chart.

## See also

- `docs/FORMATS.md` — the format map
- `docs/ARCHITECTURE.md` — direct CLI layers and portability contract
- `docs/PORTABILITY.md` — platform support, verification levels, and test matrix
- `proofs/laravel-intent-proof.md` — the repeatable first Laravel acceptance task
