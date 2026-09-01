#!/usr/bin/env node
/** Portable, dependency-free installer and doctor for agent-orchestra. */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceAgents = path.join(repoRoot, 'agents');
const sourceTeams = path.join(repoRoot, 'teams');
const sourceSkills = path.join(repoRoot, 'skills');
const persona = fs.readFileSync(path.join(repoRoot, 'AGENTS.md'), 'utf8');
const orchestraConfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'orchestra.json'), 'utf8'));
const isWindows = process.platform === 'win32';

const tools = {
  opencode: { command: 'opencode', stable: true, agentPath: ['.config', 'opencode', 'agents'] },
  claude: { command: 'claude', stable: false, agentPath: ['.claude', 'agents'] },
  codex: { command: 'codex', stable: false, agentPath: ['.codex', 'agents'] },
  cursor: { command: 'cursor', stable: false, agentPath: ['.cursor', 'agents'] },
};

function usage(code = 0) {
  console.log(`agent-orchestra

Usage:
  node orchestra.mjs install [options]
  node orchestra.mjs doctor [options]

Options:
  --tool <id[,id]>       Runtime adapter (default: opencode)
  --home <path>          Override target home (for clean-room tests)
  --project <path>       Also install project-local agents and AGENTS.md
  --project-only         Install only into --project; leave home untouched
  --conflict <policy>    fail, skip, or backup (default: fail)
  --dry-run              Show the complete plan without writing
  --installed            With doctor, require every managed file to match
  --structural           With doctor, verify files/tools without provider models
  --experimental         Enable unverified Claude/Codex/Cursor adapters
  --help                 Show this help
`);
  process.exit(code);
}

function parseArgs(argv) {
  const input = [...argv];
  const command = input[0] && !input[0].startsWith('-') ? input.shift() : 'install';
  if (!['install', 'doctor'].includes(command)) usage(1);
  const options = {
    command,
    selectedTools: [],
    home: os.homedir(),
    project: null,
    projectOnly: false,
    conflict: 'fail',
    dryRun: false,
    installed: false,
    structural: false,
    experimental: false,
  };
  const valueAfter = (flag) => {
    const value = input.shift();
    if (!value || value.startsWith('-')) throw new Error(`${flag} requires a value`);
    return value;
  };
  while (input.length) {
    const arg = input.shift();
    if (arg === '--help' || arg === '-h') usage();
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--installed') options.installed = true;
    else if (arg === '--structural') options.structural = true;
    else if (arg === '--experimental') options.experimental = true;
    else if (arg === '--tool') options.selectedTools.push(...valueAfter(arg).split(',').filter(Boolean));
    else if (arg === '--home') options.home = path.resolve(valueAfter(arg));
    else if (arg === '--project') options.project = path.resolve(valueAfter(arg));
    else if (arg === '--project-only') options.projectOnly = true;
    else if (arg === '--conflict') options.conflict = valueAfter(arg);
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!options.selectedTools.length) options.selectedTools = ['opencode'];
  if (options.projectOnly && !options.project) throw new Error('--project-only requires --project');
  options.selectedTools = [...new Set(options.selectedTools)];
  if (!['fail', 'skip', 'backup'].includes(options.conflict)) throw new Error('--conflict must be fail, skip, or backup');
  for (const tool of options.selectedTools) {
    if (!tools[tool]) throw new Error(`Unsupported tool: ${tool}`);
    if (!tools[tool].stable && !options.experimental) throw new Error(`${tool} is experimental; pass --experimental to use it`);
  }
  return options;
}

function executable(command) {
  const extensions = isWindows ? ['.exe', '.cmd', '.bat', ''] : [''];
  for (const directory of (process.env.PATH || '').split(path.delimiter)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${command}${extension}`);
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      } catch {
        // Keep searching PATH.
      }
    }
  }
  return null;
}

function version(command) {
  const binary = executable(command);
  if (!binary) return null;
  const result = spawnSync(binary, ['--version'], { encoding: 'utf8', timeout: 5000 });
  return (result.stdout || result.stderr || '').trim().split('\n')[0] || 'installed';
}

function scalar(value) {
  const text = value.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (/^-?\d+$/.test(text)) return Number(text);
  return text;
}

/** Parse the mapping-only YAML subset used by our agent frontmatter. */
function parseFrontmatter(source, label = 'agent') {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^(\s*)(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_.*-]+)):\s*(.*)$/);
    if (!match) throw new Error(`${label}: unsupported frontmatter line ${index + 1}: ${line}`);
    const indent = match[1].length;
    const key = match[2] ?? match[3] ?? match[4];
    const raw = match[5];
    while (stack.length > 1 && indent <= stack.at(-1).indent) stack.pop();
    const parent = stack.at(-1).value;
    if (raw === '>' || raw === '|') {
      const chunks = [];
      while (index + 1 < lines.length) {
        const next = lines[index + 1];
        if (next.trim() && next.match(/^\s*/)[0].length <= indent) break;
        index++;
        chunks.push(next.trim());
      }
      parent[key] = raw === '>' ? chunks.filter(Boolean).join(' ') : chunks.join('\n');
    } else if (raw === '') {
      parent[key] = {};
      stack.push({ indent, value: parent[key] });
    } else {
      parent[key] = scalar(raw);
    }
  }
  return root;
}

function parseAgent(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter`);
  return {
    name: path.basename(file, '.md'),
    frontmatter: parseFrontmatter(match[1], file),
    body: match[2].trim(),
    raw,
  };
}

function markdownFiles(directory) {
  return fs.readdirSync(directory).filter((name) => name.endsWith('.md')).sort().map((name) => path.join(directory, name));
}

function agentFiles() {
  const files = [...markdownFiles(sourceAgents)];
  for (const team of fs.readdirSync(sourceTeams).sort()) {
    const directory = path.join(sourceTeams, team);
    if (fs.statSync(directory).isDirectory()) files.push(...markdownFiles(directory));
  }
  return files;
}

function allowedPatterns(rule) {
  if (!rule || typeof rule !== 'object') return [];
  return Object.entries(rule).filter(([, action]) => action === 'allow').map(([pattern]) => pattern);
}

function claudeAgent(agent) {
  const permission = agent.frontmatter.permission;
  const allowed = new Set();
  if (permission !== 'deny') {
    if (!permission || permission.read !== 'deny') allowed.add('Read');
    if (permission && permission.edit !== 'deny' && permission.write !== 'deny') {
      allowed.add('Edit');
      allowed.add('Write');
    }
    if (permission && permission.bash !== 'deny') {
      const patterns = allowedPatterns(permission.bash);
      if (patterns.length) patterns.forEach((pattern) => allowed.add(`Bash(${pattern})`));
      else if (permission.bash) allowed.add('Bash');
    }
    if (permission && permission.task !== 'deny') allowed.add('Task');
  }
  return ['---', `name: ${agent.name}`, `description: ${agent.frontmatter.description || ''}`, 'tools:', ...[...allowed].map((tool) => `  - ${tool}`), '---', '', agent.body, ''].join('\n');
}

function codexAgent(agent) {
  const permission = agent.frontmatter.permission;
  const readOnly = permission === 'deny' || (permission && typeof permission === 'object' && (permission.edit === 'deny' || permission.write === 'deny'));
  const selectedModel = typeof agent.frontmatter.model === 'string' && agent.frontmatter.model.startsWith('openai/')
    ? agent.frontmatter.model.slice('openai/'.length)
    : null;
  const lines = [
    `name = "${agent.name}"`,
    `description = "${String(agent.frontmatter.description || '').replace(/"/g, "'")}"`,
    `sandbox_mode = "${readOnly ? 'read-only' : 'workspace-write'}"`,
  ];
  if (selectedModel) lines.push(`model = "${selectedModel}"`);
  lines.push('', 'developer_instructions = """', agent.body, '"""', '');
  return lines.join('\n');
}

function cursorAgent(agent) {
  return `# ${agent.name}\n\n## When to use\n\n${agent.frontmatter.description || ''}\n\n## Instructions\n\n${agent.body}\n`;
}

function opencodeAgent(agent, selectedModel) {
  if (!selectedModel) return agent.raw;
  if (/^model:\s*.+$/m.test(agent.raw)) return agent.raw.replace(/^model:\s*.+$/m, `model: ${selectedModel}`);
  return agent.raw.replace(/^(mode:\s*.+)$/m, `$1\nmodel: ${selectedModel}`);
}

function convert(agent, tool, selectedModel = null) {
  if (tool === 'opencode') return opencodeAgent(agent, selectedModel);
  if (tool === 'claude') return claudeAgent(agent);
  if (tool === 'codex') return codexAgent(agent);
  if (tool === 'cursor') return cursorAgent(agent);
  throw new Error(`No converter for ${tool}`);
}

function modelInventory(home) {
  const binary = executable('opencode');
  if (!binary) return [];
  const targetEnvironment = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    XDG_CONFIG_HOME: path.join(home, '.config'),
  };
  const result = spawnSync(binary, ['models'], { encoding: 'utf8', timeout: 15000, env: targetEnvironment });
  if (result.status !== 0) return [];
  return [...new Set(result.stdout.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[^\s/]+\/[^\s]+$/.test(line)))];
}

function resolveModels(inventory) {
  const available = new Set(inventory);
  return Object.fromEntries(Object.entries(orchestraConfig.modelPolicy.roles).map(([role, candidates]) => [
    role,
    candidates.find((candidate) => available.has(candidate)) || null,
  ]));
}

function portableFiles(root) {
  const files = [];
  const skipped = [];
  const visit = (directory, relative = '') => {
    for (const name of fs.readdirSync(directory).sort()) {
      const absolute = path.join(directory, name);
      const child = path.join(relative, name);
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) skipped.push({ path: absolute, target: fs.readlinkSync(absolute) });
      else if (stat.isDirectory()) visit(absolute, child);
      else if (stat.isFile()) files.push({ source: absolute, relative: child });
    }
  };
  visit(root);
  return { files, skipped };
}

function personaTarget(tool, home) {
  if (tool === 'opencode') return path.join(home, '.config', 'opencode', 'AGENTS.md');
  if (tool === 'claude') return path.join(home, '.claude', 'CLAUDE.md');
  if (tool === 'codex') return path.join(home, '.codex', 'AGENTS.md');
  return path.join(home, '.cursor', 'rules', 'lenka.mdc');
}

function buildPlan(options) {
  const operations = [];
  const warnings = [];
  const agents = agentFiles().map(parseAgent);
  const resolvedModels = options.resolvedModels || {};
  for (const tool of options.selectedTools) {
    if (!options.projectOnly) {
      const globalAgents = path.join(options.home, ...tools[tool].agentPath);
      for (const agent of agents) {
        const extension = tool === 'codex' ? '.toml' : '.md';
        operations.push({ target: path.join(globalAgents, `${agent.name}${extension}`), content: convert(agent, tool, resolvedModels[agent.name]), kind: `${tool} agent` });
      }
      const personaContent = tool === 'cursor'
        ? `---\ndescription: Lenka orchestrator persona\nalwaysApply: true\n---\n\n${persona}`
        : persona;
      operations.push({ target: personaTarget(tool, options.home), content: personaContent, kind: `${tool} persona` });
    }
    if (options.project) {
      const projectAgents = path.join(options.project, `.${tool}`, 'agents');
      for (const agent of agents) {
        const extension = tool === 'codex' ? '.toml' : '.md';
        operations.push({ target: path.join(projectAgents, `${agent.name}${extension}`), content: convert(agent, tool, resolvedModels[agent.name]), kind: `${tool} project agent` });
      }
    }
  }
  if (!options.projectOnly) {
    const skills = portableFiles(sourceSkills);
    for (const file of skills.files) {
      operations.push({ target: path.join(options.home, '.agents', 'skills', file.relative), content: fs.readFileSync(file.source), kind: 'shared skill' });
    }
    for (const link of skills.skipped) warnings.push(`Skipped non-portable symlink: ${path.relative(repoRoot, link.path)} -> ${link.target}`);
  }
  for (const [role, selectedModel] of Object.entries(resolvedModels)) {
    if (!selectedModel) warnings.push(`No available model matched ${role}; it will inherit the OpenCode default`);
  }
  if (options.project) {
    const projectInstructions = path.join(options.project, 'AGENTS.md');
    if (options.projectOnly && targetStat(projectInstructions)) {
      warnings.push(`Preserved existing project instructions: ${projectInstructions}`);
    } else {
      operations.push({ target: projectInstructions, content: persona, kind: 'project persona' });
    }
    if (options.projectOnly) {
      operations.push({
        target: path.join(options.project, '.agent-orchestra', '.gitignore'),
        content: '*\n!.gitignore\n',
        kind: 'project recovery ignore',
      });
    }
  }
  return { operations, warnings, agentCount: agents.length };
}

function sameContent(target, content) {
  if (!fs.existsSync(target)) return false;
  const desired = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return fs.readFileSync(target).equals(desired);
}

function targetStat(target) {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function classify(plan, conflict) {
  return plan.operations.map((operation) => {
    const stat = targetStat(operation.target);
    if (!stat) return { ...operation, action: 'create' };
    if (stat.isSymbolicLink()) return { ...operation, action: 'protected-symlink' };
    if (sameContent(operation.target, operation.content)) return { ...operation, action: 'unchanged' };
    if (conflict === 'skip') return { ...operation, action: 'skip' };
    if (conflict === 'backup') return { ...operation, action: 'replace' };
    return { ...operation, action: 'conflict' };
  });
}

function backupPath(root, target) {
  const relative = path.resolve(target).replace(/^[A-Za-z]:/, (drive) => drive[0]).replace(/^[/\\]+/, '').replace(/:/g, '_');
  return path.join(root, relative);
}

function atomicWrite(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.agent-orchestra-${process.pid}.tmp`;
  fs.writeFileSync(temporary, content);
  fs.renameSync(temporary, target);
}

function apply(classified, options) {
  if (options.dryRun) return 0;
  const conflicts = classified.filter((item) => item.action === 'conflict');
  if (conflicts.length) {
    console.error('\nConflicts detected; nothing was written:');
    conflicts.forEach((item) => console.error(`  ${item.target}`));
    console.error('\nChoose --conflict backup or --conflict skip explicitly.');
    return 2;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const recoveryBase = options.projectOnly
    ? path.join(options.project, '.agent-orchestra')
    : path.join(options.home, '.agent-orchestra');
  const backupRoot = path.join(recoveryBase, 'backups', stamp);
  const completed = [];
  const manifest = [];
  try {
    for (const item of classified) {
      if (!['create', 'replace'].includes(item.action)) continue;
      let backup = null;
      if (item.action === 'replace') {
        backup = backupPath(backupRoot, item.target);
        fs.mkdirSync(path.dirname(backup), { recursive: true });
        fs.copyFileSync(item.target, backup);
      }
      atomicWrite(item.target, item.content);
      completed.push({ ...item, backup });
      manifest.push({ target: item.target, action: item.action, backup });
    }
    if (manifest.length) {
      fs.mkdirSync(backupRoot, { recursive: true });
      fs.writeFileSync(path.join(backupRoot, 'manifest.json'), `${JSON.stringify({ createdAt: new Date().toISOString(), files: manifest }, null, 2)}\n`);
      console.log(`\nRecovery manifest: ${path.join(backupRoot, 'manifest.json')}`);
    }
  } catch (error) {
    for (const item of completed.reverse()) {
      if (item.backup) fs.copyFileSync(item.backup, item.target);
      else if (fs.existsSync(item.target)) fs.unlinkSync(item.target);
    }
    throw new Error(`Install failed and completed writes were rolled back: ${error.message}`);
  }
  return 0;
}

function printPlan(items, plan, options) {
  console.log('\nagent-orchestra installation plan');
  console.log('================================');
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'write'}`);
  console.log(`Tools: ${options.selectedTools.join(', ')}`);
  console.log(`Home: ${options.home}`);
  console.log(`Project: ${options.project || '(global only)'}`);
  console.log(`Scope: ${options.projectOnly ? 'project only' : 'global and requested project'}`);
  console.log(`Conflict policy: ${options.conflict}`);
  console.log(`Source agents: ${plan.agentCount}`);
  const counts = {};
  items.forEach((item) => counts[item.action] = (counts[item.action] || 0) + 1);
  console.log(`Files: ${Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(', ')}`);
  plan.warnings.forEach((warning) => console.log(`WARNING: ${warning}`));
  items.forEach((item) => console.log(`  ${item.action.padEnd(9)} ${item.target}`));
}

function doctor(options) {
  console.log('\nagent-orchestra doctor');
  console.log('======================');
  let failures = 0;
  const check = (passed, label, detail = '') => {
    console.log(`${passed ? 'PASS' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!passed) failures++;
  };
  try {
    const agents = agentFiles().map(parseAgent);
    check(agents.length > 0, 'source agents parse', `${agents.length} agents`);
    const auditor = agents.find((agent) => agent.name === 'dev-auditor');
    check(auditor?.frontmatter.permission?.edit === 'deny', 'nested permissions', 'dev-auditor edit=deny');
    check(codexAgent(auditor).includes('sandbox_mode = "read-only"'), 'read-only conversion invariant');
  } catch (error) {
    check(false, 'source validation', error.message);
  }
  const nodeVersion = version('node');
  const herdrVersion = version('herdr');
  check(Boolean(nodeVersion), 'Node.js', nodeVersion || 'not found');
  check(Boolean(herdrVersion), 'Herdr runtime', herdrVersion || 'not found');
  for (const tool of options.selectedTools) {
    const toolVersion = version(tools[tool].command);
    check(Boolean(toolVersion), `${tool} CLI`, toolVersion || 'not found');
  }
  if (options.selectedTools.includes('opencode')) {
    const inventory = modelInventory(options.home);
    const resolved = resolveModels(inventory);
    options.resolvedModels = resolved;
    if (options.structural) {
      const matchedRoutes = Object.values(resolved).filter(Boolean).length;
      console.log(`INFO OpenCode provider models — ${inventory.length} available; ${matchedRoutes}/${Object.keys(resolved).length} role routes matched`);
    } else {
      check(inventory.length > 0, 'OpenCode model inventory', inventory.length ? `${inventory.length} models` : 'no authenticated provider models found');
      for (const [role, selectedModel] of Object.entries(resolved)) {
        check(Boolean(selectedModel), `model route ${role}`, selectedModel || 'no candidate available');
      }
    }
  }
  if (!options.projectOnly) {
    const skills = portableFiles(sourceSkills);
    if (skills.skipped.length) skills.skipped.forEach((link) => console.log(`WARN non-portable source omitted — ${path.relative(repoRoot, link.path)} -> ${link.target}`));
    else console.log('PASS skill sources are portable');
  }
  const planned = buildPlan(options);
  const installationState = classify(planned, 'skip');
  const protectedCount = installationState.filter((item) => item.action === 'protected-symlink').length;
  const installed = installationState.filter((item) => item.action === 'unchanged').length;
  const expected = installationState.length - protectedCount;
  console.log(`INFO matching installed files — ${installed}/${expected}${protectedCount ? ` (${protectedCount} existing symlink(s) protected)` : ''}`);
  if (options.installed) check(installed === expected, 'managed installation matches source', `${installed}/${expected} files`);
  console.log(failures ? `\nDoctor found ${failures} blocking problem(s).` : '\nDoctor passed all blocking checks.');
  return failures ? 1 : 0;
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.command === 'doctor') return doctor(options);
  if (options.selectedTools.includes('opencode')) options.resolvedModels = resolveModels(modelInventory(options.home));
  const plan = buildPlan(options);
  const items = classify(plan, options.conflict);
  printPlan(items, plan, options);
  const result = apply(items, options);
  if (result === 0) console.log(options.dryRun ? '\nDry-run complete. Nothing was written.' : '\nInstall complete. Run `node orchestra.mjs doctor` to verify the machine.');
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}

export { parseFrontmatter, parseAgent, codexAgent, buildPlan, classify, modelInventory, resolveModels, main };
