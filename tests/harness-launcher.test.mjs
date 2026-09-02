import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const launcher = path.resolve(import.meta.dirname, '..', 'harness-launcher.mjs');

function fakeHarness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lenka-harness-'));
  const file = path.join(root, 'fake-harness');
  fs.writeFileSync(file, '#!/bin/sh\nprintf "%s\\n" "$@"\n');
  fs.chmodSync(file, 0o755);
  return file;
}

test('launcher pins the verified coordination model in Codex', () => {
  const result = spawnSync(process.execPath, [launcher], {
    encoding: 'utf8',
    env: {
      ...process.env,
      AGENT_ORCHESTRA_HARNESS: 'codex',
      AGENT_ORCHESTRA_HARNESS_BINARY: fakeHarness(),
      AGENT_ORCHESTRA_PRIMARY_MODEL: 'gpt-5.6-terra',
    },
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /codex \/ gpt-5\.6-terra/);
  assert.match(result.stdout, /--model\ngpt-5\.6-terra/);
  assert.match(result.stdout, /--config\ndeveloper_instructions=/);
  assert.match(result.stdout, /Lenka — the orchestrator/);
  assert.match(result.stdout, /--sandbox\nread-only/);
  assert.match(result.stdout, /--ask-for-approval\nnever/);
  assert.doesNotMatch(result.stdout, /--agent/);
});

test('launcher pins both Lenka and the verified model in Claude and OpenCode', () => {
  for (const [harness, model] of [['claude', 'sonnet'], ['opencode', 'opencode-go/kimi-k2.7-code']]) {
    const result = spawnSync(process.execPath, [launcher], {
      encoding: 'utf8',
      env: {
        ...process.env,
        AGENT_ORCHESTRA_HARNESS: harness,
        AGENT_ORCHESTRA_HARNESS_BINARY: fakeHarness(),
        AGENT_ORCHESTRA_PRIMARY_MODEL: model,
      },
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /--model/);
    assert.match(result.stdout, /--agent\nlenka/);
  }
});

test('launcher opens Kimi directly with the generated Lenka agent in autonomous mode', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lenka-kimi-project-'));
  fs.mkdirSync(path.join(root, '.kimi-code', 'agents'), { recursive: true });
  fs.writeFileSync(path.join(root, '.kimi-code', 'agents', 'lenka.md'), 'Lenka');
  const result = spawnSync(process.execPath, [launcher], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      AGENT_ORCHESTRA_HARNESS: 'kimi',
      AGENT_ORCHESTRA_HARNESS_BINARY: fakeHarness(),
      AGENT_ORCHESTRA_PRIMARY_MODEL: 'kimi-code/k3',
    },
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--model\nkimi-code\/k3/);
  assert.match(result.stdout, /--agent-file\n.*\.kimi-code\/agents\/lenka\.md/);
  assert.match(result.stdout, /--auto/);
});
