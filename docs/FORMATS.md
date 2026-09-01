# Agent formats — the map

One source of truth (OpenCode-format markdown in `agents/` and `teams/`) is
converted by `install.mjs` into each tool's native format.

## OpenCode

- Location: `~/.config/opencode/agents/*.md` (global), `.opencode/agents/` (project)
- Frontmatter: `description`, `mode` (primary/subagent), `model`, `permission`
  (allow/ask/deny per tool: read, edit, bash, task, skill, ...), `steps`
- Permission model: explicit allowlists, glob patterns, `"*": deny` default

## Claude Code

- Location: `~/.claude/agents/*.md` (global), `.claude/agents/` (project)
- Frontmatter: `name` (required), `description`, `tools` (allowlist), `model`
- Conversion: `permission:` → `tools:` list; Bash rules become `Bash(pattern)`
  where possible; `task` → `Task`; model lines are dropped when the model is
  not a Claude model (inherit the tool's default instead)

## Codex CLI

- Location: `~/.codex/agents/*.toml` (personal), `.codex/agents/` (project)
- Keys: `name`, `description`, `developer_instructions` (required), optional
  `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`
- Conversion: `edit: deny` → `sandbox_mode = "read-only"`; otherwise
  `"workspace-write"`; `openai/*` models are kept (prefix stripped), other
  models dropped (inherit); MCP hints from permission keys are noted in a comment

## Cursor

- Location: `~/.cursor/agents/*.md` (user), `.cursor/agents/` (project)
- Format: Markdown describing when to use the agent and its instructions
  (no strict frontmatter schema); rules in `.cursor/rules/*.mdc` with
  `alwaysApply`; skills auto-discovered from `.cursor/skills/`,
  `~/.agents/skills/`, `.claude/skills/`, `.codex/skills/`

## Rules-only tools

- Kimi CLI, Gemini CLI, Aider: no subagent manifests — they receive the Lenka
  persona via AGENTS.md (project and global). Teams work through the persona
  rules (prompt-based orchestration) until these tools gain subagent support.

## Skills

- All tools read `~/.agents/skills/` (and project `.agents/skills/`) — skills
  are installed once and work everywhere. Skill = folder with `SKILL.md`
  (frontmatter: `name`, `description`; optional `references/`, scripts).