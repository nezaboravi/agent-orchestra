import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const unix = fs.readFileSync(path.join(repoRoot, 'bootstrap.sh'), 'utf8').replace(/\r\n/g, '\n');
const windows = fs.readFileSync(path.join(repoRoot, 'bootstrap.ps1'), 'utf8').replace(/\r\n/g, '\n');

test('Unix bootstrap is strict and supports macOS and Linux architectures', () => {
  assert.match(unix, /^#!\/bin\/sh\nset -eu/m);
  assert.match(unix, /Darwin\) platform="darwin"/);
  assert.match(unix, /Linux\) platform="linux"/);
  assert.match(unix, /arm64\|aarch64/);
  assert.match(unix, /x86_64\|amd64/);
});

test('both bootstraps verify the pinned Node archive checksum', () => {
  assert.match(unix, /SHASUMS256\.txt/);
  assert.match(unix, /Node\.js checksum did not match/);
  assert.match(windows, /SHASUMS256\.txt/);
  assert.match(windows, /Get-FileHash -Algorithm SHA256/);
});

test('bootstraps install Herdr and the orchestra with platform-supported harnesses', () => {
  for (const source of [unix, windows]) {
    assert.match(source, /herdr\.dev\/(?:install|latest)/);
    assert.match(source, /orchestra\.mjs/);
    assert.match(source, /--installed/);
    assert.match(source, /--structural/);
  }
  assert.match(unix, /chatgpt\.com\/codex\/install\.sh/);
  assert.match(unix, /CANDIDATES="codex claude opencode"/);
  assert.match(unix, /trying the next configured harness/i);
  assert.match(windows, /opencode-ai/);
});

test('both bootstraps derive a dedicated Herdr session from the project path', () => {
  assert.match(unix, /session-name\.mjs/);
  assert.match(windows, /session-name\.mjs/);
  assert.match(unix, /herdr --session "\$session_name"/);
  assert.match(windows, /--session \$SessionName/);
  assert.doesNotMatch(unix, /herdr --session agent-orchestra/);
  assert.doesNotMatch(windows, /--session agent-orchestra/);
  assert.match(windows, /default_agent = "lenka"; model = \$OpenCodePrimaryModel/);
  assert.match(unix, /runtime\/\$SELECTED_HARNESS\.json/);
  assert.match(windows, /runtime\\opencode\.json/);
  assert.match(unix, /AGENT_ORCHESTRA_PRIMARY_MODEL/);
  assert.match(unix, /harness-launcher\.mjs/);
  assert.match(unix, /default_shell/);
  assert.match(windows, /default_shell/);
});

test('Unix bootstrap does not modify shell startup files', () => {
  assert.doesNotMatch(unix, /\.zshrc|\.bashrc|profile/);
});

test('Unix bootstrap verifies installed live routes with the same authenticated policy', () => {
  assert.match(unix, /if \[ "\$STRUCTURAL_ONLY" -eq 1 \]; then\n  step "Verifying the installed team structurally"/);
  assert.match(unix, /else\n  step "Verifying the installed team with authenticated model routes"\n  set -- doctor --home "\$TARGET_HOME" --installed --tool "\$SELECTED_HARNESS"/);
});
