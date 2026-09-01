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
4. **Harness** — OpenCode CLI is the first supported coding-agent harness.
5. **Proof** — tests, static checks, independent audit, cost records, and the
   project handoff turn activity into verified behavior.

Desktop clients are optional views and manual workspaces. The autonomous path
must work without a desktop application so the same repository can be tested
on macOS, Linux, and Windows.

The unattended OpenCode run may use auto mode, but auto mode is not the safety
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

OpenCode is the stable adapter. Claude Code, Codex, and Cursor adapters are
experimental until their generated output passes a real end-to-end run on the
corresponding client.

Model names are not assumed to exist on another computer. The installer asks
that computer's OpenCode CLI for its real model inventory, chooses the first
available candidate for each role, and writes the resolved model only into the
generated agent. If no provider models are available, installation can still
finish, but `doctor` fails with an authentication blocker instead of claiming
that the team is ready.

## Cross-machine acceptance test

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
