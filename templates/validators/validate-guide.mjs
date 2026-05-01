#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(process.argv[2] || process.cwd());
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const required = [
  '00-cover.md',
  '01-design-philosophy.md',
  '02-color-system.md',
  '03-typography.md',
  '04-spacing-system.md',
  '05-border-radius.md',
  '06-shadows-elevation.md',
  '07-component-states.md',
  '08-form-elements.md',
  '09-buttons.md',
  '10-navigation.md',
  '11-tables-data-display.md',
  '12-feedback-alerts.md'
];
const forbidden = [
  new RegExp('Daisy' + 'UI', 'i'),
  new RegExp('Quick ' + 'Reference', 'i'),
  new RegExp('quick' + '-' + 'reference', 'i'),
  new RegExp('§' + '13'),
  new RegExp('13' + '-' + 'quick' + '-' + 'reference'),
  new RegExp('Material ' + 'UI', 'i'),
  /Bootstrap/i,
  /Radix/i,
  /Chakra/i,
  /Mantine/i
];
const errors = [];
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function stripVersionLabel(value) {
  return String(value || '').trim().replace(/^Version\s+/i, '');
}

function readFrom(base, file) {
  return fs.readFileSync(path.join(base, file), 'utf8');
}

function read(file) {
  return readFrom(root, file);
}

function validateVersioning() {
  const manifestPath = path.join(root, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push('manifest.json: missing required version metadata');
    return;
  }

  let manifest = null;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(`manifest.json: invalid JSON: ${error.message}`);
    return;
  }

  const manifestVersion = typeof manifest.version === 'string' ? manifest.version.trim() : '';
  if (!semverPattern.test(manifestVersion)) {
    errors.push(`manifest.json: version must be semantic version X.Y.Z, got ${JSON.stringify(manifest.version)}`);
  }

  if (fs.existsSync(path.join(root, '00-cover.md'))) {
    const cover = read('00-cover.md');
    const coverVersion = cover.match(/\bVersion\s+([0-9A-Za-z][0-9A-Za-z.+-]*)\b/)?.[1] || '';
    if (!coverVersion) errors.push('00-cover.md: missing semantic version label (`Version X.Y.Z`)');
    else if (semverPattern.test(manifestVersion) && coverVersion !== manifestVersion) {
      errors.push(`00-cover.md: version ${coverVersion} must match manifest.json version ${manifestVersion}`);
    }
  }

  const demoDataPath = path.join(root, 'demo', 'demo-data.json');
  if (fs.existsSync(demoDataPath) && semverPattern.test(manifestVersion)) {
    try {
      const demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
      const demoVersion = stripVersionLabel(demoData.version);
      if (demoVersion && demoVersion !== manifestVersion) {
        errors.push(`demo/demo-data.json: version ${demoVersion} must match manifest.json version ${manifestVersion}`);
      }
    } catch (error) {
      errors.push(`demo/demo-data.json: invalid JSON: ${error.message}`);
    }
  }
}

function walkUpFor(start, dirname) {
  let current = path.resolve(start);
  while (true) {
    const candidate = path.join(current, dirname);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
    const next = path.dirname(current);
    if (next === current) return null;
    current = next;
  }
}

function findBlueprintDir() {
  if (process.env.DESIGN_GUIDE_BLUEPRINT_DIR && fs.existsSync(process.env.DESIGN_GUIDE_BLUEPRINT_DIR)) {
    return path.resolve(process.env.DESIGN_GUIDE_BLUEPRINT_DIR);
  }
  return walkUpFor(root, 'design-system-blueprint') || walkUpFor(scriptDir, 'design-system-blueprint') || walkUpFor(process.cwd(), 'design-system-blueprint');
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function parseTables(markdown) {
  const lines = markdown.split('\n');
  const found = [];
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (!lines[i].trim().startsWith('|')) continue;
    if (!/^\|[\s:-]+\|/.test(lines[i + 1].trim())) continue;
    const headers = splitRow(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length; j += 1) {
      if (!lines[j].trim().startsWith('|')) break;
      rows.push(splitRow(lines[j]));
    }
    found.push({ line: i + 1, headers, rowCount: rows.length, rows });
    i = j;
  }
  return found;
}

function parseHeadings(markdown) {
  return [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)].map((match) => ({ level: match[1].length, title: match[2].trim() }));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function headingPattern(title) {
  const parts = [];
  let cursor = 0;
  for (const match of title.matchAll(/\[[^\]]+\]/g)) {
    parts.push(escapeRegex(title.slice(cursor, match.index)));
    parts.push('.+?');
    cursor = match.index + match[0].length;
  }
  parts.push(escapeRegex(title.slice(cursor)));
  return new RegExp(`^${parts.join('')}$`);
}

function shapeFromDir(blueprintDir) {
  const files = {};
  for (const file of required) {
    const sourcePath = path.join(blueprintDir, file);
    if (!fs.existsSync(sourcePath)) continue;
    const source = readFrom(blueprintDir, file);
    files[file] = {
      headings: parseHeadings(source),
      tables: parseTables(source).map((table) => ({ headers: table.headers, rowCount: table.rowCount }))
    };
  }
  return { files };
}

function compareBlueprintShape(blueprintDir) {
  const shapePath = path.join(root, 'scripts', 'blueprint-shape.json');
  const envBlueprintDir = process.env.DESIGN_GUIDE_BLUEPRINT_DIR && fs.existsSync(process.env.DESIGN_GUIDE_BLUEPRINT_DIR)
    ? path.resolve(process.env.DESIGN_GUIDE_BLUEPRINT_DIR)
    : null;
  let shape = null;
  if (envBlueprintDir) shape = shapeFromDir(envBlueprintDir);
  else if (fs.existsSync(shapePath)) shape = JSON.parse(fs.readFileSync(shapePath, 'utf8'));
  else if (blueprintDir) shape = shapeFromDir(blueprintDir);
  else {
    errors.push('Could not locate design-system-blueprint or scripts/blueprint-shape.json for table-shape validation; set DESIGN_GUIDE_BLUEPRINT_DIR');
    return;
  }

  for (const file of required) {
    const expectedShape = shape.files?.[file];
    const generatedPath = path.join(root, file);
    if (!expectedShape || !fs.existsSync(generatedPath)) continue;
    const generated = read(file);

    const generatedHeadings = parseHeadings(generated);
    let headingCursor = 0;
    for (const expected of expectedShape.headings) {
      const pattern = headingPattern(expected.title);
      let found = false;
      for (; headingCursor < generatedHeadings.length; headingCursor += 1) {
        const actual = generatedHeadings[headingCursor];
        if (actual.level === expected.level && pattern.test(actual.title)) {
          found = true;
          headingCursor += 1;
          break;
        }
      }
      if (!found) errors.push(`${file}: missing or reordered heading from blueprint: ${'#'.repeat(expected.level)} ${expected.title}`);
    }

    const generatedTables = parseTables(generated);
    if (generatedTables.length !== expectedShape.tables.length) {
      errors.push(`${file}: table count drift; expected ${expectedShape.tables.length}, got ${generatedTables.length}`);
      continue;
    }
    for (let i = 0; i < expectedShape.tables.length; i += 1) {
      const expected = expectedShape.tables[i];
      const actual = generatedTables[i];
      if (expected.headers.join('|') !== actual.headers.join('|')) {
        errors.push(`${file}: table ${i + 1} header drift; expected [${expected.headers.join(', ')}], got [${actual.headers.join(', ')}]`);
      }
      if (expected.rowCount !== actual.rowCount) {
        errors.push(`${file}: table ${i + 1} row-count drift; expected ${expected.rowCount}, got ${actual.rowCount}`);
      }
    }
  }
}

function tableWith(markdown, ...headers) {
  return parseTables(markdown).find((table) => headers.every((header) => table.headers.includes(header)));
}

function rowsAsObjects(table) {
  if (!table) return [];
  return table.rows.map((cells) => Object.fromEntries(table.headers.map((header, index) => [header, cells[index] || ''])));
}

function isRem(value) {
  return /^0(?:\.0+)?rem$|^[0-9]+(?:\.[0-9]+)?rem$/.test(String(value).trim());
}

function isPx(value) {
  return /^[0-9]+(?:\.[0-9]+)?px$/.test(String(value).trim());
}

function isUnitless(value) {
  return /^[0-9]+(?:\.[0-9]+)?$/.test(String(value).trim());
}

function isEm(value) {
  return /^-?[0-9]+(?:\.[0-9]+)?em$/.test(String(value).trim());
}

function extractFirstValue(cell) {
  return String(cell).trim().split(/\s+/)[0];
}

function validateUnits() {
  const typography = read('03-typography.md');
  for (const row of rowsAsObjects(tableWith(typography, 'Name', 'Size', 'Weight', 'Line Height'))) {
    if (!isRem(row.Size)) errors.push(`03-typography.md: Type Scale size for ${row.Name} must use rem, got ${row.Size}`);
    if (!/^\d{3}$/.test(row.Weight)) errors.push(`03-typography.md: Type Scale weight for ${row.Name} must be numeric, got ${row.Weight}`);
    if (!isUnitless(row['Line Height'])) errors.push(`03-typography.md: Type Scale line height for ${row.Name} must be unitless, got ${row['Line Height']}`);
  }
  for (const row of rowsAsObjects(tableWith(typography, 'Category', 'Line Height', 'Tailwind'))) {
    if (!isUnitless(row['Line Height'])) errors.push(`03-typography.md: Line Height ${row.Category} must be unitless, got ${row['Line Height']}`);
  }
  for (const row of rowsAsObjects(tableWith(typography, 'Category', 'Value', 'Tailwind'))) {
    if (!isEm(row.Value)) errors.push(`03-typography.md: Letter Spacing ${row.Category} must use em, got ${row.Value}`);
  }

  const spacing = read('04-spacing-system.md');
  for (const row of rowsAsObjects(tableWith(spacing, 'Token', 'Value', 'Tailwind'))) {
    if (!isRem(row.Value)) errors.push(`04-spacing-system.md: Spacing token ${row.Token} must use rem, got ${row.Value}`);
  }

  const radius = read('05-border-radius.md');
  for (const row of rowsAsObjects(tableWith(radius, 'Token', 'Value', 'Tailwind'))) {
    if (!isRem(row.Value) && !isPx(row.Value)) errors.push(`05-border-radius.md: Radius token ${row.Token} must use rem or px, got ${row.Value}`);
  }

  const states = read('07-component-states.md');
  for (const row of rowsAsObjects(tableWith(states, 'Property', 'Value', 'CSS'))) {
    const value = extractFirstValue(row.Value);
    if (/ring width|ring offset$/i.test(row.Property) && !isPx(value)) errors.push(`07-component-states.md: ${row.Property} must use px, got ${row.Value}`);
    if (/transition/i.test(row.Property) && !/^[0-9]+ms\b/.test(row.Value)) errors.push(`07-component-states.md: Transition must use ms, got ${row.Value}`);
  }
}

function validateTokenReferences() {
  const colorVars = new Set((read('02-color-system.md').match(/--[a-zA-Z][a-zA-Z0-9-]*/g) || []));
  const radiusVars = new Set((read('05-border-radius.md').match(/--[a-zA-Z][a-zA-Z0-9-]*/g) || []));
  const declared = new Set([...colorVars, ...radiusVars]);
  for (const file of required.slice(6)) {
    const refs = read(file).match(/--[a-zA-Z][a-zA-Z0-9-]*/g) || [];
    for (const ref of refs) {
      if (!declared.has(ref)) errors.push(`${file}: references undeclared token ${ref}`);
    }
  }

  const spacingRows = rowsAsObjects(tableWith(read('04-spacing-system.md'), 'Token', 'Value', 'Tailwind'));
  const spacingTokens = new Set(spacingRows.map((row) => row.Token));
  for (const file of required.slice(3)) {
    const refs = [...read(file).matchAll(/\btoken\s+([0-9]+(?:\.[0-9]+)?)/gi)].map((match) => match[1]);
    for (const ref of refs) {
      if (!spacingTokens.has(ref)) errors.push(`${file}: references undeclared spacing token ${ref}`);
    }
  }

  const typeRows = rowsAsObjects(tableWith(read('03-typography.md'), 'Name', 'Size', 'Weight', 'Line Height'));
  const typeNames = new Set(typeRows.map((row) => row.Name));
  for (const ref of [...read('04-spacing-system.md').matchAll(/\btoken\s+([A-Z][A-Za-z ]+)/g)].map((match) => match[1].trim())) {
    if (!typeNames.has(ref)) errors.push(`04-spacing-system.md: references undeclared typography token ${ref}`);
  }

  const buttonMd = read('09-buttons.md');
  const buttonRows = rowsAsObjects(tableWith(buttonMd, 'Size', 'Icon Size', 'Usage')).map((row) => row.Size);
  const iconRows = rowsAsObjects(tableWith(buttonMd, 'Size', 'Dimensions', 'Icon Size', 'Padding')).map((row) => row.Size);
  if (buttonRows.join('|') !== 'xs|sm|md (default)|lg') errors.push(`09-buttons.md: Button Sizes rows must be xs, sm, md (default), lg; got ${buttonRows.join(', ')}`);
  if (iconRows.join('|') !== 'xs|sm|md|lg') errors.push(`09-buttons.md: Icon-Only Button Sizes rows must be xs, sm, md, lg; got ${iconRows.join(', ')}`);
}

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required chapter: ${file}`);
}

validateVersioning();

for (const file of required.filter((file) => fs.existsSync(path.join(root, file)))) {
  const text = read(file);
  if (text.includes('[') || text.includes(']')) errors.push(`${file}: contains square-bracket placeholder characters`);
  if (text.includes('[—]')) errors.push(`${file}: contains bracketed not-applicable marker; use plain em dash`);
  if (/Local Decisions Required/i.test(text)) errors.push(`${file}: contains unresolved Local Decisions Required section`);
  for (const pattern of forbidden) {
    if (pattern.test(text)) errors.push(`${file}: contains forbidden framework or stale removed-chapter reference`);
  }

  for (const table of parseTables(text)) {
    const expected = table.headers.length + 1;
    for (let index = 0; index < table.rows.length; index += 1) {
      const actual = table.rows[index].length + 1;
      if (actual !== expected) errors.push(`${file}:${table.line + index + 2}: table column count drift; expected ${expected - 1}, got ${actual - 1}`);
    }
  }
}

for (const file of required.slice(2)) {
  if (!fs.existsSync(path.join(root, file))) continue;
  const text = read(file);
  if (!/Operational Guidance/.test(text)) errors.push(`${file}: missing merged Operational Guidance`);
  if (!/Local Decisions Made/.test(text)) errors.push(`${file}: missing resolved Local Decisions Made`);
}

if (required.every((file) => fs.existsSync(path.join(root, file)))) {
  compareBlueprintShape(findBlueprintDir());
  validateUnits();
  validateTokenReferences();
}

if (errors.length) {
  console.error(`Guide validation failed for ${root}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guide validation passed for ${root}`);
