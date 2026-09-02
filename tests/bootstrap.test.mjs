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

test('both bootstraps install Herdr, OpenCode, and the orchestra', () => {
  for (const source of [unix, windows]) {
    assert.match(source, /herdr\.dev\/(?:install|latest)/);
    assert.match(source, /opencode-ai/);
    assert.match(source, /orchestra\.mjs/);
    assert.match(source, /--installed/);
    assert.match(source, /--structural/);
  }
});

test('both bootstraps use a dedicated Herdr session', () => {
  assert.match(unix, /herdr --session agent-orchestra/);
  assert.match(windows, /--session agent-orchestra/);
  assert.match(unix, /OPENCODE_CONFIG_CONTENT='\{"default_agent":"lenka"\}'/);
  assert.match(windows, /OPENCODE_CONFIG_CONTENT = '\{"default_agent":"lenka"\}'/);
  assert.match(unix, /default_shell/);
  assert.match(windows, /default_shell/);
});

test('Unix bootstrap does not modify shell startup files', () => {
  assert.doesNotMatch(unix, /\.zshrc|\.bashrc|profile/);
});
