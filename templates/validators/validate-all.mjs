#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
function positionalArg(valueFlags = ['--export-dir', '--demo-dir']) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (valueFlags.includes(arg)) {
      index += 1;
      continue;
    }
    if (!arg.startsWith('-')) return arg;
  }
  return null;
}
function readArg(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] || null;
}
const guideArg = positionalArg();
const guideRoot = path.resolve(guideArg || process.cwd());
const here = path.dirname(fileURLToPath(import.meta.url));
const noWrite = process.argv.includes('--no-write') || process.argv.includes('--read-only');
const exportDir = readArg('--export-dir');
const demoDir = readArg('--demo-dir');
const validators = [
  'validate-guide.mjs',
  'validate-tailwind-export.mjs',
  'validate-demo.mjs'
];
const failures = [];
const results = [];

function updateManifest(status) {
  const manifestPath = path.join(guideRoot, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const guideDisplay = path.relative(process.cwd(), guideRoot) || '.';
  const exportFlag = exportDir ? ` --export-dir ${path.relative(process.cwd(), path.resolve(exportDir)) || '.'}` : '';
  const demoFlag = demoDir ? ` --demo-dir ${path.relative(process.cwd(), path.resolve(demoDir)) || '.'}` : '';
  manifest.validation = {
    ...(manifest.validation || {}),
    status,
    commands: {
      guide: `node ${path.relative(process.cwd(), path.join(here, 'validate-guide.mjs'))} ${guideDisplay}`,
      tailwind: `node ${path.relative(process.cwd(), path.join(here, 'validate-tailwind-export.mjs'))} ${guideDisplay}${exportFlag}`,
      demo: `node ${path.relative(process.cwd(), path.join(here, 'validate-demo.mjs'))} ${guideDisplay}${demoFlag} --require-css`,
      all: `node ${path.relative(process.cwd(), path.join(here, 'validate-all.mjs'))} ${guideDisplay}${exportFlag}${demoFlag}`
    },
    results
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

for (const validator of validators) {
  const validatorArgs = [path.join(here, validator), guideRoot];
  if (validator === 'validate-tailwind-export.mjs' && exportDir) validatorArgs.push('--export-dir', path.resolve(exportDir));
  if (validator === 'validate-demo.mjs') {
    if (demoDir) validatorArgs.push('--demo-dir', path.resolve(demoDir));
    validatorArgs.push('--require-css');
  }
  if (noWrite) validatorArgs.push('--no-write');
  const result = spawnSync(process.execPath, validatorArgs, {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const passed = result.status === 0;
  results.push({ validator, status: passed ? 'passed' : 'failed' });
  if (!passed) failures.push(validator);
}

if (failures.length) {
  if (!noWrite) updateManifest('failed');
  console.error(`Validation failed: ${failures.join(', ')}`);
  process.exit(1);
}

if (!noWrite) updateManifest('passed');
console.log(`All validations passed for ${guideRoot}`);
