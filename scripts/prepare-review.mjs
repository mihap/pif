#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const guideArg = args.find((arg, index) => !arg.startsWith('-') && (index === 0 || !args[index - 1].startsWith('-')));

function usage() {
  console.log(`Usage: node scripts/prepare-review.mjs <guide-dir>\n\nWrites <guide-dir>/review/review-packet.md for an independent reviewer.`);
}

if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}
if (!guideArg) {
  usage();
  process.exit(1);
}

const guideRoot = path.resolve(guideArg);
if (!fs.existsSync(guideRoot)) {
  console.error(`Guide directory does not exist: ${guideRoot}`);
  process.exit(1);
}

function shellQuote(value) {
  if (value === '') return "''";
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function normalizeSlashes(value) {
  return value.replace(/\\/g, '/');
}

const commandCwd = path.resolve(process.cwd());
const commandCwdDisplay = commandCwd === repoRoot ? '.' : commandCwd;
function displayPath(filePath) {
  const relative = path.relative(commandCwd, filePath) || '.';
  return normalizeSlashes(relative.startsWith('..') || path.isAbsolute(relative) ? filePath : relative);
}

const artifactRoot = path.resolve(commandCwd, 'tmp', 'pif');
const exportDir = path.join(artifactRoot, 'export');
const demoDir = path.join(artifactRoot, 'demo');
const pifDisplay = displayPath(repoRoot);
const guideDisplay = displayPath(guideRoot);
const exportDisplay = displayPath(exportDir);
const demoDisplay = displayPath(demoDir);

const reviewDir = path.join(guideRoot, 'review');
fs.mkdirSync(reviewDir, { recursive: true });
const prompt = fs.readFileSync(path.join(repoRoot, 'templates', 'review', 'guide-review-prompt.md'), 'utf8')
  .replaceAll('{guide-dir}', guideDisplay)
  .replaceAll('{demo-dir}', demoDisplay)
  .replaceAll('{export-dir}', exportDisplay)
  .replaceAll('{pif-root}', pifDisplay);
const files = fs.readdirSync(guideRoot)
  .filter((file) => /^\d{2}-.*\.md$/.test(file) || file === 'manifest.json')
  .sort();
const visualChecklistPath = path.join(repoRoot, 'templates', 'review', 'demo-visual-review.md');
const visualChecklist = fs.existsSync(visualChecklistPath) ? fs.readFileSync(visualChecklistPath, 'utf8').trimEnd() : '';
const packet = `${prompt}\n\n---\n\n## Files to Review\n\n${files.map((file) => `- ${normalizeSlashes(path.join(guideDisplay, file))}`).join('\n')}\n\n## Recommended Commands\n\nThese commands reset to the directory where this packet was generated before running. Override \`EXPORT_DIR\` or \`DEMO_DIR\` if you want artifacts somewhere else.\n\n\`\`\`bash\nREVIEW_CWD=${shellQuote(commandCwdDisplay)}\nPIF_ROOT=${shellQuote(pifDisplay)}\nGUIDE_DIR=${shellQuote(guideDisplay)}\nEXPORT_DIR=${shellQuote(exportDisplay)}\nDEMO_DIR=${shellQuote(demoDisplay)}\n\ncd "$REVIEW_CWD"\nnode "$PIF_ROOT/scripts/build-tailwind-export.mjs" "$GUIDE_DIR" --out "$EXPORT_DIR" --build\nnode "$PIF_ROOT/scripts/build-demo.mjs" "$GUIDE_DIR" --out "$DEMO_DIR" --build\nnode "$PIF_ROOT/templates/validators/validate-all.mjs" "$GUIDE_DIR" --export-dir "$EXPORT_DIR" --demo-dir "$DEMO_DIR" --no-write\nnode "$GUIDE_DIR/scripts/validate-all.mjs" "$GUIDE_DIR" --export-dir "$EXPORT_DIR" --demo-dir "$DEMO_DIR" --no-write\n\`\`\`\n\n---\n\n${visualChecklist}\n`;
fs.writeFileSync(path.join(reviewDir, 'review-packet.md'), packet);
console.log(`Wrote ${path.join(reviewDir, 'review-packet.md')}`);
