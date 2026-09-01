# agent-orchestra

Your portable development team: Lenka orchestrates specialized agents that turn
intent into verified behavior. Herdr is the persistent runtime and OpenCode CLI
is the first fully supported execution harness.

## What you get

- **Lenka** — the orchestrator persona. She recognizes the domain of your
  request, calls the right team — or creates a new one on the fly (least
  privilege, plan → execute → verify → prove).
- **14 core agents** — explorer, implementer, verifier, reviewer, debugger,
  browser-ops, frontend-qa, task-manager, vision, handoff, and more — each
  with one role and the least possible power.
- **Band teams** — domain teams with their own flow:
  - `dev` — dev-lead, dev-planner, dev-ticketer, dev-dag, dev-builder,
    dev-tester, dev-auditor (plan → Taskavel tickets → DAG → build → prove)
  - more teams (email, travel, finance...) follow the same template
- **Shared skills** — resend, email best practices, DNS, crash diagnosis, ...
  installed to the portable `~/.agents/skills` source location.

## Start on a new computer

The bootstrap detects the platform, installs an isolated Node.js runtime when
needed, installs Herdr and OpenCode, installs the team, verifies every managed
file and model route, and opens Lenka directly inside a dedicated
`agent-orchestra` Herdr session.
It does not depend on Homebrew, Laravel Herd, a particular username, or a
machine-specific project directory.

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

OpenCode provider credentials are never copied by this repository. If the
machine has no model matching the declared roles, verification stops and names
that blocker instead of silently sending project code to a temporary free
model. Connect the provider in OpenCode and run the same bootstrap again.

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

## Inspect the installer manually

```sh
git clone https://github.com/nezaboravi/agent-orchestra
cd agent-orchestra
node orchestra.mjs doctor
node orchestra.mjs install --dry-run
node orchestra.mjs install --conflict backup
node orchestra.mjs doctor --installed
```

The doctor command checks Node.js, Herdr, OpenCode, agent definitions, and
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

OpenCode is the stable adapter. Other format converters are present for testing
but require `--experimental`; they are not claimed as end-to-end supported yet.

| Tool | Status | Agents (global) | Teams (explicit project install) | Persona |
|---|---|---|---|---|
| OpenCode | Supported | `~/.config/opencode/agents/*.md` | `.opencode/agents/` | `~/.config/opencode/AGENTS.md` |
| Claude Code | Experimental | `~/.claude/agents/*.md` | `.claude/agents/` | `~/.claude/CLAUDE.md` |
| Codex | Experimental | `~/.codex/agents/*.toml` | `.codex/agents/` | `~/.codex/AGENTS.md` |
| Cursor | Experimental | `~/.cursor/agents/*.md` | `.cursor/agents/` | `~/.cursor/rules/lenka.mdc` |

Shared skills are installed into `~/.agents/skills`. Project files are never
written merely because the installer was launched from that directory.

## Runtime

Start Herdr from a project and run OpenCode in a pane:

```sh
cd /path/to/project
herdr
opencode
```

The bootstrap uses the named `agent-orchestra` session and starts OpenCode with
Lenka as its default primary agent, so it never silently reattaches an unrelated
default workspace such as another active project.
Herdr keeps the real terminal sessions alive and exposes agent state and
automation. It does not replace OpenCode; it gives the agent team somewhere to
run. Desktop clients remain optional.

The user's explicit instruction to start work authorizes normal agent dispatch.
The orchestra announces the selected roles and models, then continues without
another approval prompt. Destructive operations and external writes still stop
at a fresh human-approval boundary.

## Configuration model

- **Rules are portable** — repository files are the source of truth.
- **Agents are generated safely** — nested permissions are parsed and checked;
  unverified adapters are opt-in.
- **Skills have one source** — adapters expose the shared location when their
  client supports it.
- **Models are inventoried** — dispatch is chosen from models available on the
  current machine and actual usage is reported after the run.

## See also

- `docs/FORMATS.md` — the format map
- `docs/ARCHITECTURE.md` — Herdr/OpenCode layers and portability contract
- `docs/PORTABILITY.md` — platform support, verification levels, and test matrix
- `proofs/laravel-intent-proof.md` — the repeatable first Laravel acceptance task
