#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const full = process.argv.includes('--full') || process.env.SMOKE_FULL === '1';
const tmpRoot = path.join(repoRoot, 'tmp');
const smokeGuide = path.join(tmpRoot, 'smoke-product-design-guide');
const exampleGuide = path.join(repoRoot, 'examples', 'mailpilot-design-guide');
const errors = [];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    stdio: options.quiet ? 'pipe' : 'inherit'
  });
  return result;
}

function expectPass(label, command, args, options = {}) {
  const result = run(command, args, options);
  if (result.status !== 0) errors.push(`${label} failed with exit code ${result.status}`);
  return result;
}

function expectFail(label, command, args, options = {}) {
  const result = run(command, args, { ...options, quiet: true });
  if (result.status === 0) errors.push(`${label} unexpectedly passed`);
  return result;
}

function assertExists(label, filePath) {
  if (!fs.existsSync(filePath)) errors.push(`${label} missing: ${path.relative(repoRoot, filePath)}`);
}

function assertMissing(label, filePath) {
  if (fs.existsSync(filePath)) errors.push(`${label} should not exist: ${path.relative(repoRoot, filePath)}`);
}

fs.rmSync(smokeGuide, { recursive: true, force: true });
fs.rmSync(path.join(tmpRoot, 'pif'), { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

expectPass('create-guide scaffold', process.execPath, ['scripts/create-guide.mjs', 'Smoke Product', '--out', 'tmp']);
expectFail('invalid scaffold version', process.execPath, ['scripts/create-guide.mjs', 'Bad Version', '--out', 'tmp', '--version', 'not-semver']);

for (const file of [
  '00-cover.md',
  '12-feedback-alerts.md',
  'manifest.json',
  'demo/demo.schema.json',
  'scripts/blueprint-shape.json',
  'scripts/validate-all.mjs'
]) {
  assertExists('scaffold file', path.join(smokeGuide, file));
}
assertMissing('scaffold Tailwind artifact directory', path.join(smokeGuide, 'tailwind'));
assertMissing('scaffold demo HTML artifact', path.join(smokeGuide, 'demo/index.html'));
const smokeManifest = JSON.parse(fs.readFileSync(path.join(smokeGuide, 'manifest.json'), 'utf8'));
if (smokeManifest.version !== '0.1.0') errors.push(`scaffold manifest version should be 0.1.0, got ${smokeManifest.version}`);

expectFail('placeholder scaffold guide validation', process.execPath, ['templates/validators/validate-guide.mjs', smokeGuide]);
expectPass('MailPilot guide validation', process.execPath, ['templates/validators/validate-guide.mjs', exampleGuide]);
expectPass('MailPilot demo render', process.execPath, ['scripts/build-demo.mjs', exampleGuide]);
expectPass('MailPilot demo validation', process.execPath, ['templates/validators/validate-demo.mjs', exampleGuide]);

if (full) {
  expectPass('MailPilot Tailwind export build', process.execPath, ['scripts/build-tailwind-export.mjs', exampleGuide, '--build']);
  expectPass('MailPilot demo CSS build', process.execPath, ['scripts/build-demo.mjs', exampleGuide, '--build']);
  expectPass('MailPilot full validation', process.execPath, ['templates/validators/validate-all.mjs', exampleGuide]);
} else {
  console.log('Skipping Tailwind build validation; run `node scripts/smoke-test.mjs --full` for the full smoke test.');
}

if (errors.length) {
  console.error('Smoke test failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(full ? 'Full smoke test passed.' : 'Smoke test passed.');
