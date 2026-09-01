# Agent formats — the map

One source of truth (OpenCode-format markdown in `agents/` and `teams/`) is
installed by `orchestra.mjs`. OpenCode is the stable adapter. The other
converters below are experimental until each one passes an end-to-end client
test on a clean machine.

## OpenCode

- Location: `~/.config/opencode/agents/*.md` (global), `.opencode/agents/` (project)
- Frontmatter: `description`, `mode` (primary/subagent), `model`, `permission`
  (allow/ask/deny per tool: read, edit, bash, task, skill, ...), `steps`
- Permission model: explicit allowlists, glob patterns, `"*": deny` default

## Claude Code (experimental)

- Location: `~/.claude/agents/*.md` (global), `.claude/agents/` (project)
- Frontmatter: `name` (required), `description`, `tools` (allowlist), `model`
- Conversion: `permission:` → `tools:` list; Bash rules become `Bash(pattern)`
  where possible; `task` → `Task`; model lines are dropped when the model is
  not a Claude model (inherit the tool's default instead)

## Codex CLI (experimental)

- Location: `~/.codex/agents/*.toml` (personal), `.codex/agents/` (project)
- Keys: `name`, `description`, `developer_instructions` (required), optional
  `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`
- Conversion: `edit: deny` → `sandbox_mode = "read-only"`; otherwise
  `"workspace-write"`; `openai/*` models are kept (prefix stripped), other
  models dropped (inherit); MCP hints from permission keys are noted in a comment

## Cursor (experimental)

- Location: `~/.cursor/agents/*.md` (user), `.cursor/agents/` (project)
- Format: Markdown describing when to use the agent and its instructions
  (no strict frontmatter schema); rules in `.cursor/rules/*.mdc` with
  `alwaysApply`; skills auto-discovered from `.cursor/skills/`,
  `~/.agents/skills/`, `.claude/skills/`, `.codex/skills/`

## Skills

- Skills are installed into `~/.agents/skills/` as one portable source. A
  client is claimed as supported only after its adapter proves discovery and
  execution from that location. A skill is a folder with `SKILL.md`
  (frontmatter: `name`, `description`; optional `references/` and scripts).
