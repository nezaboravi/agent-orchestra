# Architecture

agent-orchestra separates the team's behavior from the tools that execute it.
The public repository is the source of truth; no machine-specific setup is an
implicit dependency.

## Layers

1. **Intent** — the human states the outcome in ordinary language.
2. **Orchestra** — `orchestra.json`, agent definitions, and team rules define
   roles, workflow, permissions, model classes, evidence, and escalation.
3. **Runtime** — Herdr owns persistent terminal sessions and exposes agent
   state and automation primitives.
4. **Harness** — Codex, Claude Code, or OpenCode executes the same team rules.
5. **Proof** — tests, static checks, independent audit, cost records, and the
   project handoff turn activity into verified behavior.

Desktop clients are optional views and manual workspaces. The autonomous path
must work without a desktop application so the same repository can be tested
on macOS, Linux, and Windows.

An explicit user instruction to start work authorizes normal team dispatch, so
the orchestra announces the plan and continues without a redundant approval
prompt. An unattended harness may use auto mode, but auto mode is not the safety
boundary. Explicit agent-level denials remain the boundary: destructive Git,
file deletion, database resets, remote shells, downloads, publishing, and
external-directory access are denied. Work that genuinely requires one of
those capabilities moves to a separate human-approved run.

## Portable installation contract

The installer must:

- support a no-write dry run;
- refuse silent overwrites;
- preserve existing symbolic links instead of replacing their targets;
- back up replaced files only when explicitly requested;
- create a recovery manifest;
- finish transactionally or roll back completed writes;
- reject or omit absolute, machine-specific symlinks;
- support an isolated target home for clean-room tests;
- install into a project only when `--project` is provided;
- provide a project-only proof mode that leaves the user's home untouched;
- preserve project-owned instructions such as Laravel Boost `AGENTS.md`;
- validate nested permissions before generating another tool's format.

Codex and Claude Code have authenticated model and generated-format proofs;
their full team behavior proofs are still pending. Cursor stays experimental
until its generated output passes a real end-to-end run.

Model names and credentials belong to an adapter. The Unix bootstrap tries the
declared harness order (`codex`, `claude`, `opencode`) and requires a minimal
live response before selecting one. Codex uses its ChatGPT sign-in and own model
catalog; Claude Code uses its own sign-in and starts with Haiku; OpenCode tests its declared provider
candidates and can fall through from a rejected provider to Kimi. Tokens are
never copied between authentication stores. A failed candidate is skipped; if
all candidates fail, installation stops without claiming READY.

## Cross-machine acceptance test

The supported entrypoints are `bootstrap.sh` on macOS/Linux and
`bootstrap.ps1` on Windows. They provide the prerequisite installation and run
the lower-level sequence below. See `docs/PORTABILITY.md` for the platform
matrix and the difference between structural, authenticated, and behavioral
proof.

The same commit must pass this sequence on every test computer:

```sh
node orchestra.mjs doctor
node orchestra.mjs install --dry-run
node orchestra.mjs install --conflict backup
node orchestra.mjs doctor --installed
```

Then Herdr must run the same small Laravel task through PLAN, BUILD, VERIFY,
and PROVE. The result is accepted only when the trace names the actual agents
and models, records available token and cost data, includes independent test
and audit evidence, and saves a handoff.

Machine-specific fixes are not acceptance-test exceptions. They must become a
portable repository change and the sequence must be repeated from the start.
