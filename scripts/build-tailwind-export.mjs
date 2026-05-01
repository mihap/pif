#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  buildTailwindWorkspace,
  defaultArtifactDir,
  positionalArg,
  readArg,
  relativeDisplay,
  writeTailwindWorkspace
} from './lib/tailwind-workspace.mjs';

const args = process.argv.slice(2);
const guideArg = positionalArg(args);
const build = args.includes('--build');
const outArg = readArg(args, '--out') || readArg(args, '-o');
const outputRoot = path.resolve(outArg || defaultArtifactDir('export'));

function usage() {
  console.log(`Usage: node scripts/build-tailwind-export.mjs <guide-dir> [--out <dir>] [--build]\n\nExtracts guide tokens into a standalone Tailwind export workspace. By default the workspace is refreshed under tmp/pif/export so generated export artifacts do not live inside the guide directory.`);
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
if (outputRoot === guideRoot || outputRoot.startsWith(`${guideRoot}${path.sep}`)) {
  console.error('Export output must be outside the guide directory. Use the default tmp/pif/export or another disposable artifact directory.');
  process.exit(1);
}

writeTailwindWorkspace({
  guideRoot,
  outputRoot,
  cssFile: 'design-guide.css',
  packageName: `${path.basename(guideRoot)}-tailwind-export`,
  title: 'Tailwind Export',
  description: 'Standalone generated Tailwind token export. This directory is disposable output; copy or integrate the files you need into the target project.'
});

if (build) {
  const status = buildTailwindWorkspace(outputRoot);
  if (status !== 0) process.exit(status);
}

const manifestPath = path.join(guideRoot, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.tailwindExport = {
    outputDir: relativeDisplay(outputRoot),
    package: 'package.json',
    theme: 'src/theme.css',
    tokens: 'src/tokens.json',
    css: 'dist/design-guide.css',
    artifactPolicy: 'Generated under tmp/pif/export; do not commit unless intentionally integrating a copy into the product.'
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Wrote Tailwind export workspace to ${relativeDisplay(outputRoot)}`);
console.log(build ? 'Export build is complete; files are ready to integrate into the project.' : 'Export source files are ready; rerun with --build to produce dist/design-guide.css.');
