#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const harness = process.env.AGENT_ORCHESTRA_HARNESS;
const binary = process.env.AGENT_ORCHESTRA_HARNESS_BINARY;
const model = process.env.AGENT_ORCHESTRA_PRIMARY_MODEL;

if (!['codex', 'claude', 'opencode'].includes(harness) || !binary || !model) {
  console.error('ERROR: Lenka launcher is missing a verified harness or coordination model.');
  process.exit(1);
}

const args = ['--model', model];
if (harness === 'codex') {
  const persona = fs.readFileSync(path.join(repoRoot, 'AGENTS.md'), 'utf8');
  args.push('--config', `developer_instructions=${JSON.stringify(persona)}`);
  args.push('--sandbox', 'read-only', '--ask-for-approval', 'never');
} else {
  args.push('--agent', 'lenka');
}

console.log(`Lenka is conducting with ${harness} / ${model}`);
const result = spawnSync(binary, args, { stdio: 'inherit', env: process.env });
if (result.error) {
  console.error(`ERROR: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
