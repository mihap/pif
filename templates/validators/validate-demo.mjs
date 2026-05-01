#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function positionalArg(valueFlags = ['--demo-dir']) {
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
const guideArg = positionalArg();
const outIndex = args.indexOf('--demo-dir');
const guideRoot = path.resolve(guideArg || process.cwd());
const demoRoot = path.resolve(outIndex === -1 ? path.join(process.cwd(), 'tmp', 'pif', 'demo') : args[outIndex + 1]);
const requireCss = args.includes('--require-css');
const errors = [];
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const frameworkPattern = new RegExp(['Daisy' + 'UI', 'Material ' + 'UI', 'Bootstrap', 'Radix', 'Chakra', 'Mantine'].join('|'), 'i');
const removedChapterPattern = new RegExp(['Quick ' + 'Reference', 'quick' + '-' + 'reference', '§' + '13', '13' + '-' + 'quick' + '-' + 'reference'].join('|'), 'i');

function read(file) {
  return fs.readFileSync(path.join(demoRoot, file), 'utf8');
}

function stripVersionLabel(value) {
  return String(value || '').trim().replace(/^Version\s+/i, '');
}

function readManifestVersion() {
  const manifestPath = path.join(guideRoot, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return typeof manifest.version === 'string' ? manifest.version.trim() : null;
  } catch (error) {
    errors.push(`manifest.json: invalid JSON: ${error.message}`);
    return null;
  }
}

const guideVersion = readManifestVersion();

function guideTokenPrefix() {
  const counts = new Map();
  for (const file of ['02-color-system.md', '05-border-radius.md']) {
    const filePath = path.join(guideRoot, file);
    if (!fs.existsSync(filePath)) continue;
    const text = fs.readFileSync(filePath, 'utf8');
    for (const match of text.matchAll(/--([a-z][a-z0-9]*)-(?:color|radius)-[a-z0-9-]+/gi)) {
      const prefix = match[1].toLowerCase();
      counts.set(prefix, (counts.get(prefix) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'pif';
}

const guidePrefix = guideTokenPrefix();

function guideChapters() {
  return fs.readdirSync(guideRoot)
    .filter((file) => /^\d{2}-.*\.md$/.test(file) && !file.startsWith('00-'))
    .sort();
}

function validateSchema(schema, value, location) {
  if (!schema) return;
  if (schema.type) {
    const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (type !== schema.type) {
      errors.push(`${location} should be ${schema.type}, got ${type}`);
      return;
    }
  }
  if (schema.type === 'string') {
    if (schema.minLength && value.length < schema.minLength) errors.push(`${location} should have minLength ${schema.minLength}`);
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) errors.push(`${location} does not match pattern ${schema.pattern}`);
    if (schema.enum && !schema.enum.includes(value)) errors.push(`${location} should be one of ${schema.enum.join(', ')}`);
  }
  if (schema.type === 'array') {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${location} should have at least ${schema.minItems} item(s)`);
    value.forEach((item, index) => validateSchema(schema.items, item, `${location}[${index}]`));
  }
  if (schema.type === 'object') {
    for (const requiredKey of schema.required || []) {
      if (!(requiredKey in value)) errors.push(`${location} missing required property ${requiredKey}`);
    }
    const properties = schema.properties || {};
    for (const [key, child] of Object.entries(value)) {
      if (properties[key]) validateSchema(properties[key], child, `${location}.${key}`);
      else if (schema.additionalProperties === false) errors.push(`${location} contains additional property ${key}`);
    }
  }
}

function isInsideDirectory(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function isLocalStylesheetPath(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  if (path.isAbsolute(text) || path.win32.isAbsolute(text) || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) return false;
  const parts = text.replace(/\\/g, '/').split('/');
  return !parts.includes('..');
}

function stylesheetHrefs(html) {
  const hrefs = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel=(['"])stylesheet\1/i.test(tag)) continue;
    const href = tag.match(/\bhref=(['"])(.*?)\1/i)?.[2];
    if (href) hrefs.push(href);
  }
  return hrefs;
}

for (const file of ['index.html', 'demo.schema.json', 'demo-data.json']) {
  if (!fs.existsSync(path.join(demoRoot, file))) errors.push(`Missing demo file: demo/${file}`);
}

let data = null;
let schema = null;
if (fs.existsSync(path.join(demoRoot, 'demo.schema.json'))) {
  try {
    schema = JSON.parse(read('demo.schema.json'));
  } catch (error) {
    errors.push(`demo/demo.schema.json is invalid JSON: ${error.message}`);
  }
}
if (fs.existsSync(path.join(demoRoot, 'demo-data.json'))) {
  try {
    data = JSON.parse(read('demo-data.json'));
  } catch (error) {
    errors.push(`demo/demo-data.json is invalid JSON: ${error.message}`);
  }
}

if (data) {
  if (schema) validateSchema(schema, data, 'demo-data.json');
  const exampleSchema = schema?.properties?.sections?.items?.properties?.examples?.items;
  const allowedTypes = new Set(exampleSchema?.properties?.type?.enum || ['color', 'typography', 'spacing', 'surface', 'state', 'form', 'button', 'navigation', 'table', 'feedback', 'screen']);
  const rootRequired = schema?.required || ['guideName', 'version', 'description', 'stylesheet', 'sections'];
  const seenIds = new Set();
  for (const key of rootRequired.filter((item) => item !== 'sections')) {
    if (typeof data[key] !== 'string' || data[key].length === 0) errors.push(`demo-data.json missing string field: ${key}`);
  }
  const demoVersion = stripVersionLabel(data.version);
  if (!semverPattern.test(demoVersion)) errors.push(`demo-data.json version must be semantic display form Version X.Y.Z, got ${JSON.stringify(data.version)}`);
  if (guideVersion && semverPattern.test(guideVersion) && demoVersion !== guideVersion) errors.push(`demo-data.json version ${demoVersion} must match guide version ${guideVersion}`);
  const allowedRootKeys = new Set(Object.keys(schema?.properties || {}));
  if (allowedRootKeys.size) {
    for (const key of Object.keys(data)) {
      if (!allowedRootKeys.has(key)) errors.push(`demo-data.json contains additional root property not allowed by schema: ${key}`);
    }
  }
  if (!Array.isArray(data.sections) || data.sections.length === 0) errors.push('demo-data.json must contain non-empty sections array');
  const expectedChapters = guideChapters();
  const actualChapterSet = new Set((data.sections || []).map((section) => section.sourceChapter));
  const missingChapters = expectedChapters.filter((chapter) => !actualChapterSet.has(chapter));
  if (missingChapters.length) {
    errors.push(`demo-data.json sourceChapter coverage missing: ${missingChapters.join(', ')}`);
  }
  for (const section of data.sections || []) {
    if (!section.id || !section.title || !section.sourceChapter || !section.description) errors.push(`demo section is missing id, title, sourceChapter, or description: ${JSON.stringify(section)}`);
    if (!/^[a-z0-9-]+$/.test(section.id || '')) errors.push(`demo section has invalid id: ${section.id}`);
    if (seenIds.has(section.id)) errors.push(`duplicate demo section id: ${section.id}`);
    seenIds.add(section.id);
    if (section.sourceChapter && !fs.existsSync(path.join(guideRoot, section.sourceChapter))) errors.push(`demo section ${section.id} references missing chapter ${section.sourceChapter}`);
    if (!Array.isArray(section.examples) || section.examples.length === 0) errors.push(`demo section ${section.id} must contain examples`);
    for (const example of section.examples || []) {
      if (!example.id || !example.title || !example.description || !example.type) errors.push(`demo example in ${section.id} is missing required fields`);
      if (!allowedTypes.has(example.type)) errors.push(`demo example ${example.id} has invalid type: ${example.type}`);
      if (!Array.isArray(example.tokens)) errors.push(`demo example ${example.id} must include tokens array`);
      if (example.markup) errors.push(`demo example ${example.id} must use structured props, not raw markup`);
      const propsText = JSON.stringify(example.props || {});
      if (guidePrefix !== 'mp' && /\bmp-icon-|--mp-/i.test(propsText)) {
        errors.push(`demo example ${example.id} contains stale mp-prefixed classes or variables; expected ${guidePrefix}-prefixed demo utilities`);
      }
    }
  }
}

if (fs.existsSync(path.join(demoRoot, 'index.html'))) {
  const html = read('index.html');
  if (html.includes('[') || html.includes(']')) errors.push('demo/index.html contains square-bracket placeholder characters');
  if (/{{|}}/.test(html)) errors.push('demo/index.html contains unresolved template placeholders');
  if (guidePrefix !== 'mp' && /\bmp-icon-|--mp-/i.test(html)) {
    errors.push(`demo/index.html contains stale mp-prefixed classes or variables; expected ${guidePrefix}-prefixed demo utilities`);
  }
  if (frameworkPattern.test(html)) errors.push('demo/index.html contains non-Tailwind framework contamination');
  if (removedChapterPattern.test(html)) errors.push('demo/index.html contains stale removed-chapter reference');
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push('demo/index.html missing title');
  if (!/<nav\b[^>]*aria-label=/i.test(html)) errors.push('demo/index.html missing labelled nav landmark');
  if (!/<main\b/i.test(html)) errors.push('demo/index.html missing main landmark');
  if (/<input\b/i.test(html) && !/<label\b/i.test(html)) errors.push('demo/index.html contains inputs but no labels');

  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
  const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!ids.has(href)) errors.push(`Link targets missing section id: ${href}`);
  }
  if (data) {
    const sectionIds = new Set(data.sections.map((section) => section.id));
    for (const sectionId of sectionIds) {
      if (!ids.has(sectionId)) errors.push(`demo/index.html missing section id from data: ${sectionId}`);
    }
    const sidebarHtml = html.match(/<nav\b[^>]*aria-label="Demo sections"[^>]*>[\s\S]*?<\/nav>/i)?.[0] || '';
    const sidebarTargets = [...sidebarHtml.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    if (sidebarTargets.length !== sectionIds.size) errors.push(`demo sidebar link count mismatch; expected ${sectionIds.size}, got ${sidebarTargets.length}`);
    for (const sectionId of sectionIds) {
      if (!sidebarTargets.includes(sectionId)) errors.push(`demo sidebar missing link for section id: ${sectionId}`);
    }
    const stylesheet = data.stylesheet || data.tailwindExport;
    if (!stylesheet) errors.push('demo-data.json missing stylesheet field');
    else {
      if (!data.stylesheet) errors.push('demo-data.json must use canonical stylesheet field');
      if (!isLocalStylesheetPath(stylesheet)) errors.push(`demo stylesheet must be a relative local path inside the demo workspace: ${stylesheet}`);
      const hrefs = stylesheetHrefs(html);
      if (!hrefs.includes(stylesheet)) errors.push(`demo/index.html does not link configured stylesheet ${stylesheet}`);
      const stylesheetPath = path.resolve(demoRoot, stylesheet);
      if (!isInsideDirectory(demoRoot, stylesheetPath)) errors.push(`demo stylesheet escapes the demo workspace: ${stylesheet}`);
      if (requireCss && (!fs.existsSync(stylesheetPath) || fs.statSync(stylesheetPath).size === 0)) errors.push(`demo stylesheet is missing or empty: ${stylesheet}`);
    }
  }
}

if (errors.length) {
  console.error(`Demo validation failed for ${demoRoot}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Demo validation passed for ${demoRoot}`);
