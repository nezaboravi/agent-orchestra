# agent-orchestra

Teams of specialized agents, one orchestrator — Lenka. Install it in any agent
CLI: OpenCode, Claude Code, Codex, Cursor, Kimi, Gemini, Aider. Cross-platform:
Windows, macOS, Linux.

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
  installed to `~/.agents/skills` (read by every tool).

## Install

```sh
git clone https://github.com/nezaboravi/agent-orchestra
cd agent-orchestra
node install.mjs
```

Requires Node.js only (you already have it if you use any of these CLIs).

The installer detects which tools you have and converts the agents into each
tool's native format — nothing to copy by hand:

| Tool | Agents (global) | Teams (per project) | Persona |
|---|---|---|---|
| OpenCode | `~/.config/opencode/agents/*.md` | `.opencode/agents/` | `~/.config/opencode/AGENTS.md` |
| Claude Code | `~/.claude/agents/*.md` | `.claude/agents/` | `~/.claude/CLAUDE.md` |
| Codex | `~/.codex/agents/*.toml` | `.codex/agents/` | `~/.codex/AGENTS.md` |
| Cursor | `~/.cursor/agents/*.md` | `.cursor/agents/` | `~/.cursor/rules/lenka.mdc` |
| Kimi / Gemini / Aider | rules only | — | `~/.<tool>/AGENTS.md` |

Skills for everyone: `~/.agents/skills` (shared location read by all tools).
Project `AGENTS.md` (Lenka persona) is written into the repo you run the
installer from.

## After install

Open your agent CLI in any project:

```
> Lenka: Hello, I'm your orchestrator. Dev team is ready. What are we building?
```

## Configuration model

- **Rules are portable** — AGENTS.md works in every tool.
- **Agents are converted** — the source of truth is OpenCode-format markdown;
  the installer generates Claude/Codex/Cursor formats.
- **Skills are shared** — one location, every tool reads it.
- **Models are your choice** — agents inherit your tool's model; per-agent
  `model:` lines are honored where supported (OpenCode, Codex).

## See also

- `docs/FORMATS.md` — the format map
- The bandstands website — the full story, diagrams and examples