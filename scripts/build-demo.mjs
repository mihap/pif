#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildTailwindWorkspace,
  defaultArtifactDir,
  emptyArtifactDir,
  positionalArg,
  readArg,
  relativeDisplay,
  writeTailwindWorkspace
} from './lib/tailwind-workspace.mjs';
import { displayGuideVersion, readGuideVersion } from './lib/version.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const guideArg = positionalArg(args);
const scaffold = args.includes('--scaffold-data');
const build = args.includes('--build');
const outArg = readArg(args, '--out') || readArg(args, '-o');
const demoRoot = path.resolve(outArg || defaultArtifactDir('demo'));

function usage() {
  console.log(`Usage: node scripts/build-demo.mjs <guide-dir> [--out <dir>] [--scaffold-data] [--build]\n\nRenders the deterministic demo into tmp/pif/demo by default. The demo workspace owns its HTML, data copy, Tailwind sources, and demo CSS so generated artifacts do not live inside the guide directory.`);
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
if (demoRoot === guideRoot || demoRoot.startsWith(`${guideRoot}${path.sep}`)) {
  console.error('Demo output must be outside the guide directory. Use the default tmp/pif/demo or another disposable artifact directory.');
  process.exit(1);
}

const guideDemoRoot = path.join(guideRoot, 'demo');
fs.mkdirSync(guideDemoRoot, { recursive: true });
emptyArtifactDir(demoRoot);

const schemaSource = path.join(repoRoot, 'templates', 'demo', 'demo.schema.json');
const guideSchemaPath = path.join(guideDemoRoot, 'demo.schema.json');
const demoSchemaPath = path.join(demoRoot, 'demo.schema.json');
fs.copyFileSync(schemaSource, guideSchemaPath);
fs.copyFileSync(schemaSource, demoSchemaPath);

const guideDataPath = path.join(guideDemoRoot, 'demo-data.json');
if (!fs.existsSync(guideDataPath) || scaffold) {
  const guideName = fs.readFileSync(path.join(guideRoot, '00-cover.md'), 'utf8').split('\n')[0].replace(/^#\s*/, '').trim();
  const sections = fs.readdirSync(guideRoot)
    .filter((name) => /^\d{2}-.*\.md$/.test(name) && !name.startsWith('00-'))
    .sort()
    .map((name) => {
      const title = fs.readFileSync(path.join(guideRoot, name), 'utf8').split('\n')[0].replace(/^#\s*\d+\.\s*/, '').trim();
      const id = title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return {
        id,
        title,
        sourceChapter: name,
        description: `Demonstrates ${title.toLowerCase()} decisions from ${name}.`,
        examples: [
          {
            id: `${id}-example`,
            title: `${title} example`,
            description: `Structured demo example for ${title.toLowerCase()}.`,
            type: name.startsWith('02-') ? 'color' : name.startsWith('03-') ? 'typography' : name.startsWith('04-') ? 'spacing' : name.startsWith('05-') || name.startsWith('06-') ? 'surface' : name.startsWith('07-') ? 'state' : name.startsWith('08-') ? 'form' : name.startsWith('09-') ? 'button' : name.startsWith('10-') ? 'navigation' : name.startsWith('11-') ? 'table' : 'feedback',
            tokens: [],
            props: {}
          }
        ]
      };
    });
  const data = {
    guideName,
    version: displayGuideVersion(readGuideVersion(guideRoot)),
    description: 'Generated deterministic design guide demo.',
    stylesheet: './dist/demo.css',
    sections
  };
  fs.writeFileSync(guideDataPath, `${JSON.stringify(data, null, 2)}\n`);
}

const data = JSON.parse(fs.readFileSync(guideDataPath, 'utf8'));
let dataChanged = false;
if (!data.version) {
  data.version = displayGuideVersion(readGuideVersion(guideRoot));
  dataChanged = true;
}
if (!data.stylesheet) {
  data.stylesheet = './dist/demo.css';
  dataChanged = true;
}
if ('tailwindExport' in data) {
  delete data.tailwindExport;
  dataChanged = true;
}
if (dataChanged) fs.writeFileSync(guideDataPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(demoRoot, 'demo-data.json'), `${JSON.stringify(data, null, 2)}\n`);

const render = spawnSync(process.execPath, [path.join(repoRoot, 'templates', 'demo', 'build-demo.mjs'), guideRoot, '--out', demoRoot], {
  encoding: 'utf8',
  stdio: 'inherit'
});
if (render.status !== 0) process.exit(render.status || 1);

writeTailwindWorkspace({
  guideRoot,
  outputRoot: demoRoot,
  cssFile: 'demo.css',
  packageName: `${path.basename(guideRoot)}-demo`,
  title: 'Design Guide Demo',
  description: 'Disposable demo workspace generated from demo-data.json and the design guide tokens.',
  extraSourceFiles: [path.join(demoRoot, 'index.html')],
  clean: false
});

if (build) {
  const status = buildTailwindWorkspace(demoRoot);
  if (status !== 0) process.exit(status);
}

const manifestPath = path.join(guideRoot, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.demo = {
    outputDir: relativeDisplay(demoRoot),
    sourceData: 'demo/demo-data.json',
    schema: 'demo.schema.json',
    data: 'demo-data.json',
    html: 'index.html',
    css: 'dist/demo.css',
    sourceTemplate: 'templates/demo/index.html',
    artifactPolicy: 'Generated under tmp/pif/demo; do not commit unless intentionally integrating a copy into the product.'
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Wrote demo workspace to ${relativeDisplay(demoRoot)}`);
console.log(build ? `Open ${relativeDisplay(path.join(demoRoot, 'index.html'))} for approval.` : 'Demo HTML and source files are ready; rerun with --build to produce dist/demo.css before visual approval.');
