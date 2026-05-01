#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_GUIDE_VERSION, isGuideVersion, normalizeGuideVersion } from './lib/version.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function usage() {
  console.log(`Usage: node scripts/create-guide.mjs <name> [--version <semver>] [--target <dir> | --out <parent-dir>] [--examples] [--force] [--overwrite-chapters] [--overwrite-manifest]\n\nCreates a new design guide directory from design-system-blueprint and copies reusable validator/demo templates. --version sets the initial guide SemVer and defaults to ${DEFAULT_GUIDE_VERSION}. --target writes to the exact directory (for example docs/styleguide). --out writes under a parent directory using the generated slug. --force refreshes support files; --overwrite-chapters replaces markdown chapters; --overwrite-manifest replaces manifest.json.`);
}

function readArg(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] || null;
}

if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const name = readArg('--name') || readArg('-n') || args.find((arg) => !arg.startsWith('-'));
if (!name) {
  usage();
  process.exit(1);
}

const force = args.includes('--force');
const overwriteChapters = args.includes('--overwrite-chapters');
const overwriteManifest = args.includes('--overwrite-manifest');
const useExamples = args.includes('--examples');
const outArg = readArg('--out') || readArg('-o');
const targetArg = readArg('--target') || readArg('-t');
const guideVersion = normalizeGuideVersion(readArg('--version') || DEFAULT_GUIDE_VERSION);
if (!isGuideVersion(guideVersion)) {
  console.error(`Guide version must be semantic version X.Y.Z, got: ${guideVersion}`);
  process.exit(1);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const baseSlug = slugify(name);
const slug = targetArg ? slugify(path.basename(path.resolve(targetArg))) || baseSlug : baseSlug.endsWith('design-guide') ? baseSlug : `${baseSlug}-design-guide`;
const parent = outArg ? path.resolve(outArg) : useExamples ? path.join(repoRoot, 'examples') : process.cwd();
const target = targetArg ? path.resolve(targetArg) : path.join(parent, slug);

function copyDir(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function parseTables(markdown) {
  const lines = markdown.split('\n');
  const tables = [];
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (!lines[i].trim().startsWith('|')) continue;
    if (!/^\|[\s:-]+\|/.test(lines[i + 1].trim())) continue;
    const headers = splitRow(lines[i]);
    let rowCount = 0;
    let j = i + 2;
    for (; j < lines.length; j += 1) {
      if (!lines[j].trim().startsWith('|')) break;
      rowCount += 1;
    }
    tables.push({ headers, rowCount });
    i = j;
  }
  return tables;
}

function parseHeadings(markdown) {
  return [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((match) => ({ level: match[1].length, title: match[2].trim() }));
}

function writeBlueprintShape(blueprintDir, destination) {
  const files = {};
  for (const entry of fs.readdirSync(blueprintDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const markdown = fs.readFileSync(path.join(blueprintDir, entry.name), 'utf8');
    files[entry.name] = { headings: parseHeadings(markdown), tables: parseTables(markdown) };
  }
  fs.writeFileSync(destination, `${JSON.stringify({ files }, null, 2)}\n`);
}

if (fs.existsSync(target)) {
  if (!force) {
    console.error(`Target already exists: ${target}`);
    console.error('Use --force to overwrite generated support files. Add --overwrite-chapters only if you intentionally want to replace markdown chapters.');
    process.exit(1);
  }
} else {
  fs.mkdirSync(target, { recursive: true });
}

const blueprint = path.join(repoRoot, 'design-system-blueprint');
for (const entry of fs.readdirSync(blueprint, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
  const destination = path.join(target, entry.name);
  if (!fs.existsSync(destination) || overwriteChapters) fs.copyFileSync(path.join(blueprint, entry.name), destination);
}

fs.mkdirSync(path.join(target, 'scripts'), { recursive: true });
copyDir(path.join(repoRoot, 'templates', 'validators'), path.join(target, 'scripts'));
writeBlueprintShape(blueprint, path.join(target, 'scripts', 'blueprint-shape.json'));

fs.mkdirSync(path.join(target, 'demo'), { recursive: true });
const demoSchemaSource = path.join(repoRoot, 'templates', 'demo', 'demo.schema.json');
const demoSchemaTarget = path.join(target, 'demo', 'demo.schema.json');
if (!fs.existsSync(demoSchemaTarget) || force) fs.copyFileSync(demoSchemaSource, demoSchemaTarget);

const manifestPath = path.join(target, 'manifest.json');
if (!fs.existsSync(manifestPath) || overwriteManifest) {
  const manifest = {
    guideName: name,
    slug,
    version: guideVersion,
    status: 'scaffolded',
    sourceMode: 'Generated from design-system-blueprint; values require user direction or source material.',
    frameworkPolicy: 'Tailwind CSS utility conventions only; component-framework agnostic.',
    tailwindSupport: 'Latest stable Tailwind only.',
    artifactPolicy: 'Generated demo and Tailwind export workspaces are written to tmp/pif/demo and tmp/pif/export, not committed inside the guide directory.',
    tokenSources: {
      colors: '02-color-system.md',
      typography: '03-typography.md',
      spacing: '04-spacing-system.md',
      radius: '05-border-radius.md',
      elevation: '06-shadows-elevation.md',
      buttonIconSizes: '09-buttons.md'
    },
    appendicesMerged: false,
    localDecisionsResolved: false,
    artifacts: {
      demo: 'tmp/pif/demo',
      tailwindExport: 'tmp/pif/export'
    },
    validation: { status: 'not-run', commands: {} }
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Created ${target}`);
console.log('Next: fill guide values, merge appendices, build Tailwind export, build demo, then run validators.');
