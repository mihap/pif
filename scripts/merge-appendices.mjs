#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const guideRoot = path.resolve(args.find((arg) => !arg.startsWith('-')) || '');
const allowUnresolved = args.includes('--allow-unresolved');
const force = args.includes('--force');

function usage() {
  console.log(`Usage: node scripts/merge-appendices.mjs <guide-dir> [--allow-unresolved] [--force]\n\nMerges design-system-blueprint-appendices guidance into matching generated guide chapters.`);
}

if (!guideRoot || args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(guideRoot ? 0 : 1);
}

if (!fs.existsSync(guideRoot)) {
  console.error(`Guide directory does not exist: ${guideRoot}`);
  process.exit(1);
}

function section(text, heading) {
  const pattern = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  const match = text.match(pattern);
  if (!match) return '';
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const next = rest.search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function subsections(bestPractices) {
  const result = [];
  const matches = [...bestPractices.matchAll(/^### (.+)$/gm)];
  for (let i = 0; i < matches.length; i += 1) {
    const title = matches[i][1].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : bestPractices.length;
    result.push({ title, body: bestPractices.slice(start, end).trim() });
  }
  return result;
}

function destinationFor(number) {
  return fs.readdirSync(guideRoot).find((name) => name.startsWith(`${number}-`) && name.endsWith('.md'));
}

function insertIntoH2(text, h2, block) {
  const headingPattern = new RegExp(`^## ${h2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  const match = text.match(headingPattern);
  if (!match) return { text, inserted: false };
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const next = rest.search(/^## /m);
  const insertAt = next === -1 ? text.length : start + next;
  const existingSection = text.slice(start, insertAt);
  if (!force && /### Operational Guidance/.test(existingSection)) return { text, inserted: false };
  const prefix = text.slice(0, insertAt).replace(/\s*$/, '\n\n');
  const suffix = text.slice(insertAt).replace(/^\s*/, '\n');
  return { text: `${prefix}${block}\n${suffix}`, inserted: true };
}

const appendixDir = path.join(repoRoot, 'design-system-blueprint-appendices');
const appendixFiles = fs.readdirSync(appendixDir).filter((name) => /^\d{2}-.*\.md$/.test(name)).sort();
const unresolved = [];
const changed = [];

for (const appendixName of appendixFiles) {
  const number = appendixName.slice(0, 2);
  const destName = destinationFor(number);
  if (!destName) continue;

  const appendix = fs.readFileSync(path.join(appendixDir, appendixName), 'utf8');
  const best = section(appendix, 'Best Practices by Blueprint Section');
  const doBody = section(appendix, 'DO');
  const dontBody = section(appendix, "DON'T");
  const local = section(appendix, 'Local Decisions Required');
  const destinationPath = path.join(guideRoot, destName);
  let chapter = fs.readFileSync(destinationPath, 'utf8');
  let didChange = false;

  for (const sub of subsections(best)) {
    const block = `### Operational Guidance\n\n${sub.body}`;
    const result = insertIntoH2(chapter, sub.title, block);
    chapter = result.text;
    didChange ||= result.inserted;
  }

  if (!/## Operational DO/.test(chapter)) {
    chapter = `${chapter.replace(/\s*$/, '\n\n')}---\n\n## Operational DO\n\n${doBody}\n`;
    didChange = true;
  }
  if (!/## Operational DON'T/.test(chapter)) {
    chapter = `${chapter.replace(/\s*$/, '\n\n')}\n## Operational DON'T\n\n${dontBody}\n`;
    didChange = true;
  }

  if (local) {
    if (allowUnresolved) {
      if (!/## Local Decisions Required/.test(chapter) && !/## Local Decisions Made/.test(chapter)) {
        chapter = `${chapter.replace(/\s*$/, '\n\n')}\n## Local Decisions Required\n\n${local}\n`;
        didChange = true;
      }
    } else if (!/## Local Decisions Made/.test(chapter)) {
      unresolved.push(`${destName}:\n${local}`);
    }
  }

  if (didChange) {
    fs.writeFileSync(destinationPath, chapter);
    changed.push(destName);
  }
}

if (unresolved.length) {
  console.error('Appendices contain local decisions that must be resolved before production-ready output.');
  console.error('Run with --allow-unresolved to insert blocking questions, or add Local Decisions Made sections manually.');
  for (const item of unresolved) console.error(`\n${item}`);
  process.exit(1);
}

const manifestPath = path.join(guideRoot, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.appendicesMerged = true;
  manifest.localDecisionsResolved = !allowUnresolved;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Merged appendices into ${guideRoot}`);
if (changed.length) console.log(`Changed: ${changed.join(', ')}`);
