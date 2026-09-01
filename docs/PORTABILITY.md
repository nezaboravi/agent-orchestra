# Portability

The public acceptance target is one repository and the same user experience on
macOS, Linux, and Windows. Paths under `/Users`, `/home/<name>`, Laravel Herd,
Homebrew, and a developer's existing shell configuration are not dependencies.

## Platform entrypoints

| Platform | Entrypoint | Supported architectures | Herdr | OpenCode |
|---|---|---|---|---|
| macOS | `./bootstrap.sh` | Apple silicon, Intel | native | native |
| Linux | `./bootstrap.sh` | aarch64, x86_64 | native | native |
| Windows | `.\bootstrap.ps1` | x86_64; ARM64 through x86_64 Herdr emulation | native ConPTY | native |

Both entrypoints install runtime files below the selected user's home, prepend
those paths only for the bootstrap process, install the same agent definitions,
run structural verification, run authenticated model-route verification, and
open Lenka in the named `agent-orchestra` Herdr session. Unix bootstrap does not edit
`.zshrc`, `.bashrc`, or profile files. Windows bootstrap also keeps its runtime
inside the orchestra directory instead of depending on Chocolatey or Scoop.

## Verification levels

1. **Static** — shell syntax, JavaScript tests, workflow/schema checks.
2. **Clean runtime** — no Node.js, Herdr, or OpenCode is inherited from the
   normal user path; the bootstrap downloads and verifies its own tools.
3. **Authenticated readiness** — the installed OpenCode account exposes a
   model for every role and every generated file matches the source.
4. **Behavior proof** — Herdr and OpenCode execute the same Laravel intent
   through PLAN, BUILD, VERIFY, and PROVE, with usage and handoff evidence.

Passing a lower level never implies a higher one. Provider login is a real
human credential boundary; it is not bypassed, copied, or replaced with an
unannounced free model.

## Automated matrix

`.github/workflows/portable-bootstrap.yml` runs the project-only bootstrap on
GitHub-hosted macOS, Ubuntu, and Windows machines. It uses structural mode
because CI does not receive private provider credentials. A release is not
called cross-platform ready until this matrix passes and authenticated physical
machine proofs are recorded separately.

## Current local evidence

On 2026-09-01 the macOS Apple-silicon path passed both:

- a clean-runtime project-only bootstrap with checksum-verified Node.js 24.20.0,
  Herdr 0.8.2, and OpenCode 1.18.25; and
- an authenticated project-only bootstrap with 48 inventoried models, all five
  role routes resolved, and 22/22 managed project files matching.

Linux and Windows scripts and CI jobs exist, but their CI results are pending
until this branch is pushed. They must not be described as runtime-verified
before those jobs pass.
