import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildPlan, classify, codexAgent, main, parseAgent, parseFrontmatter, resolveModels } from '../orchestra.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

function silently(callback) {
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    return callback();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

test('frontmatter parser preserves nested permission maps', () => {
  const parsed = parseFrontmatter(`description: test
permission:
  edit: deny
  bash:
    "*": deny
    "php artisan test*": allow`);

  assert.deepEqual(parsed.permission, {
    edit: 'deny',
    bash: {
      '*': 'deny',
      'php artisan test*': 'allow',
    },
  });
});

test('Codex conversion keeps auditors read-only and builders writable', () => {
  const auditor = parseAgent(path.join(repoRoot, 'teams', 'dev', 'dev-auditor.md'));
  const builder = parseAgent(path.join(repoRoot, 'teams', 'dev', 'dev-builder.md'));

  assert.match(codexAgent(auditor), /sandbox_mode = "read-only"/);
  assert.match(codexAgent(builder), /sandbox_mode = "workspace-write"/);
});

test('unattended builder keeps destructive and external operations denied', () => {
  const builder = parseAgent(path.join(repoRoot, 'teams', 'dev', 'dev-builder.md'));
  const permission = builder.frontmatter.permission;

  assert.equal(permission.edit, 'allow');
  assert.equal(permission.external_directory, 'deny');
  for (const command of ['git push*', 'git reset*', 'rm *', 'sudo *', 'ssh *', 'curl *', 'gh *', 'php artisan db:wipe*']) {
    assert.equal(permission.bash[command], 'deny', `${command} must stay denied`);
  }
});

test('explicit start instruction dispatches without redundant confirmation', () => {
  const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'orchestra.json'), 'utf8'));
  const lenka = fs.readFileSync(path.join(repoRoot, 'agents', 'lenka.md'), 'utf8');

  assert.equal(config.modelPolicy.humanConfirmationBeforeFirstDispatch, false);
  assert.match(lenka, /user's explicit instruction to start the job is dispatch authorization/);
  assert.doesNotMatch(lenka, /Announce and ask before dispatch/);
});

test('clean-room plan omits machine-specific symlinks', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-plan-'));
  const plan = buildPlan({
    selectedTools: ['opencode'],
    home: path.join(root, 'home'),
    project: path.join(root, 'project'),
  });

  assert.equal(plan.agentCount, 21);
  assert.ok(plan.warnings.some((warning) => warning.includes('skills/omarchy')));
  assert.equal(plan.operations.some((operation) => operation.target.includes(`${path.sep}omarchy${path.sep}`)), false);
});

test('project-only scope never plans a write into home', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-project-only-'));
  const home = path.join(root, 'home');
  const project = path.join(root, 'project');
  const plan = buildPlan({
    selectedTools: ['opencode'],
    home,
    project,
    projectOnly: true,
    resolvedModels: {},
  });

  assert.ok(plan.operations.length > 0);
  assert.ok(plan.operations.every((operation) => operation.target.startsWith(`${project}${path.sep}`)));
  assert.equal(plan.operations.some((operation) => operation.target.startsWith(`${home}${path.sep}`)), false);
  assert.ok(plan.operations.some((operation) => operation.target === path.join(project, '.agent-orchestra', '.gitignore')));
});

test('project-only recovery data stays inside the project', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-project-recovery-'));
  const home = path.join(root, 'home');
  const project = path.join(root, 'project');

  assert.equal(silently(() => main(['install', '--home', home, '--project', project, '--project-only'])), 0);
  assert.equal(fs.existsSync(path.join(home, '.agent-orchestra')), false);
  assert.ok(fs.existsSync(path.join(project, '.agent-orchestra', '.gitignore')));
  assert.ok(fs.existsSync(path.join(project, '.agent-orchestra', 'backups')));
});

test('project-only scope preserves existing project instructions', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-project-rules-'));
  const project = path.join(root, 'project');
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(path.join(project, 'AGENTS.md'), 'framework-owned instructions\n');
  const plan = buildPlan({
    selectedTools: ['opencode'],
    home: path.join(root, 'home'),
    project,
    projectOnly: true,
    resolvedModels: {},
  });

  assert.equal(plan.operations.some((operation) => operation.target === path.join(project, 'AGENTS.md')), false);
  assert.ok(plan.warnings.some((warning) => warning.includes('Preserved existing project instructions')));
});

test('declared workflow resolves to real team agents', () => {
  const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'orchestra.json'), 'utf8'));
  const declared = [config.team.entrypoint, ...config.team.workflow.map((step) => step.role)];

  for (const role of declared) {
    assert.ok(fs.existsSync(path.join(repoRoot, 'teams', 'dev', `${role}.md`)), `${role} must exist`);
  }
  assert.deepEqual(config.team.workflow.map((step) => step.phase), ['plan', 'build', 'verify', 'prove']);
  assert.equal(config.modelPolicy.humanConfirmationBeforeFirstDispatch, false);
});

test('model routing selects real candidates and degrades honestly', () => {
  const resolved = resolveModels([
    'openai/gpt-5.6-luna',
    'opencode-go/deepseek-v4-flash',
    'openai/gpt-5.6-sol',
  ]);

  assert.equal(resolved['dev-lead'], 'openai/gpt-5.6-luna');
  assert.equal(resolved['dev-planner'], 'openai/gpt-5.6-luna');
  assert.equal(resolved['dev-builder'], 'openai/gpt-5.6-luna');
  assert.equal(resolved['dev-tester'], 'opencode-go/deepseek-v4-flash');
  assert.equal(resolved['dev-auditor'], 'openai/gpt-5.6-sol');
  assert.ok(Object.values(resolveModels([])).every((model) => model === null));
});

test('resolved models are written only into generated role agents', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-models-'));
  const plan = buildPlan({
    selectedTools: ['opencode'],
    home: path.join(root, 'home'),
    project: null,
    resolvedModels: { 'dev-lead': 'openai/gpt-5.6-luna' },
  });
  const lead = plan.operations.find((operation) => operation.target.endsWith(`${path.sep}dev-lead.md`));
  const planner = plan.operations.find((operation) => operation.target.endsWith(`${path.sep}dev-planner.md`));

  assert.match(lead.content, /^model: openai\/gpt-5\.6-luna$/m);
  assert.doesNotMatch(planner.content, /^model:/m);
});

test('doctor does not call a CLI-only clean room ready without models', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-no-models-'));
  assert.equal(silently(() => main(['doctor', '--home', home])), 1);
});

test('clean-room install is repeatable and creates a recovery manifest', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-install-'));
  const home = path.join(root, 'home');
  const project = path.join(root, 'project');
  const args = ['install', '--home', home, '--project', project];

  assert.equal(silently(() => main(args)), 0);
  assert.ok(fs.existsSync(path.join(home, '.config', 'opencode', 'agents', 'dev-lead.md')));
  assert.ok(fs.existsSync(path.join(project, '.opencode', 'agents', 'dev-auditor.md')));
  assert.ok(fs.existsSync(path.join(project, 'AGENTS.md')));

  const repeatedPlan = buildPlan({ selectedTools: ['opencode'], home, project });
  assert.ok(classify(repeatedPlan, 'fail').every((operation) => operation.action === 'unchanged'));
  assert.equal(silently(() => main(args)), 0);

  const backupRoot = path.join(home, '.agent-orchestra', 'backups');
  assert.ok(fs.readdirSync(backupRoot).some((directory) => fs.existsSync(path.join(backupRoot, directory, 'manifest.json'))));
});

test('default conflict policy refuses every write transactionally', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-conflict-'));
  const home = path.join(root, 'home');
  const personaPath = path.join(home, '.config', 'opencode', 'AGENTS.md');
  fs.mkdirSync(path.dirname(personaPath), { recursive: true });
  fs.writeFileSync(personaPath, 'existing personal configuration\n');

  assert.equal(silently(() => main(['install', '--home', home])), 2);
  assert.equal(fs.readFileSync(personaPath, 'utf8'), 'existing personal configuration\n');
  assert.equal(fs.existsSync(path.join(home, '.config', 'opencode', 'agents', 'dev-lead.md')), false);
});

test('dry-run reports conflicts without failing or writing', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-dry-run-'));
  const home = path.join(root, 'home');
  const personaPath = path.join(home, '.config', 'opencode', 'AGENTS.md');
  fs.mkdirSync(path.dirname(personaPath), { recursive: true });
  fs.writeFileSync(personaPath, 'keep me\n');

  assert.equal(silently(() => main(['install', '--home', home, '--dry-run'])), 0);
  assert.equal(fs.readFileSync(personaPath, 'utf8'), 'keep me\n');
  assert.equal(fs.existsSync(path.join(home, '.config', 'opencode', 'agents', 'dev-lead.md')), false);
});

test('existing persona symlinks are protected under every conflict policy', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-symlink-'));
  const home = path.join(root, 'home');
  const canonical = path.join(root, 'PERSONALITY.md');
  const personaPath = path.join(home, '.config', 'opencode', 'AGENTS.md');
  fs.mkdirSync(path.dirname(personaPath), { recursive: true });
  fs.writeFileSync(canonical, 'canonical personality\n');
  fs.symlinkSync(canonical, personaPath);

  assert.equal(silently(() => main(['install', '--home', home, '--conflict', 'backup'])), 0);
  assert.equal(fs.lstatSync(personaPath).isSymbolicLink(), true);
  assert.equal(fs.readlinkSync(personaPath), canonical);
  assert.equal(fs.readFileSync(canonical, 'utf8'), 'canonical personality\n');
});

test('backup conflict policy preserves replaced content', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-orchestra-backup-'));
  const home = path.join(root, 'home');
  const personaPath = path.join(home, '.config', 'opencode', 'AGENTS.md');
  fs.mkdirSync(path.dirname(personaPath), { recursive: true });
  fs.writeFileSync(personaPath, 'configuration before orchestra\n');

  assert.equal(silently(() => main(['install', '--home', home, '--conflict', 'backup'])), 0);
  const backupRoot = path.join(home, '.agent-orchestra', 'backups');
  const manifests = fs.readdirSync(backupRoot).map((directory) => path.join(backupRoot, directory, 'manifest.json'));
  const manifest = JSON.parse(fs.readFileSync(manifests[0], 'utf8'));
  const replaced = manifest.files.find((file) => file.target === personaPath);

  assert.equal(replaced.action, 'replace');
  assert.equal(fs.readFileSync(replaced.backup, 'utf8'), 'configuration before orchestra\n');
  assert.equal(fs.readFileSync(personaPath, 'utf8'), fs.readFileSync(path.join(repoRoot, 'AGENTS.md'), 'utf8'));
});
