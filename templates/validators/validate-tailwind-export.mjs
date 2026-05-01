#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
function positionalArg(valueFlags = ['--export-dir']) {
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
const outIndex = args.indexOf('--export-dir');
const guideRoot = path.resolve(guideArg || process.cwd());
const noWrite = process.argv.includes('--no-write') || process.argv.includes('--read-only');
const tailwindRoot = path.resolve(outIndex === -1 ? path.join(process.cwd(), 'tmp', 'pif', 'export') : args[outIndex + 1]);
const tailwindDisplay = path.relative(process.cwd(), tailwindRoot) || '.';
const errors = [];
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const frameworkPattern = new RegExp(['Daisy' + 'UI', 'Material ' + 'UI', 'Bootstrap', 'Radix', 'Chakra', 'Mantine'].join('|'), 'i');
const removedChapterPattern = new RegExp(['Quick ' + 'Reference', 'quick' + '-' + 'reference', '§' + '13', '13' + '-' + 'quick' + '-' + 'reference'].join('|'), 'i');

const required = [
  'package.json',
  'src/theme.css',
  'src/tokens.json',
  'src/input.css',
  'src/fixture.html',
  'dist/design-guide.css'
];

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

function parseColor(value) {
  const text = String(value).trim();
  const oklch = text.match(/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)$/i);
  if (oklch) {
    const l = oklch[1].endsWith('%') ? Number.parseFloat(oklch[1]) / 100 : Number.parseFloat(oklch[1]);
    const c = Number.parseFloat(oklch[2]);
    const h = Number.parseFloat(oklch[3]) * Math.PI / 180;
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);
    const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = l - 0.0894841775 * a - 1.2914855480 * b;
    const l3 = lPrime ** 3;
    const m3 = mPrime ** 3;
    const s3 = sPrime ** 3;
    return {
      r: clamp(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
      g: clamp(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
      b: clamp(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3)
    };
  }
  const hex = text.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const number = Number.parseInt(hex[1], 16);
    return { r: srgbToLinear((number >> 16) & 255), g: srgbToLinear((number >> 8) & 255), b: srgbToLinear(number & 255) };
  }
  const rgb = text.match(/^rgb\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\)$/i) || text.match(/^rgb\(\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)\s*\)$/i);
  if (rgb) return { r: srgbToLinear(Number(rgb[1])), g: srgbToLinear(Number(rgb[2])), b: srgbToLinear(Number(rgb[3])) };
  const hsl = text.match(/^hsl\(\s*([0-9.]+)(?:deg)?[\s,]+([0-9.]+)%[\s,]+([0-9.]+)%\s*\)$/i);
  if (hsl) {
    const [r, g, b] = hslToRgb(Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100);
    return { r: srgbToLinear(r), g: srgbToLinear(g), b: srgbToLinear(b) };
  }
  return null;
}

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

function hslToRgb(h, s, l) {
  const hue = (((h % 360) + 360) % 360) / 360;
  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channels = [hue + 1 / 3, hue, hue - 1 / 3].map((t) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  });
  return channels.map((channel) => Math.round(channel * 255));
}

function srgbToLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function escapeSelectorClass(className) {
  return className
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/\//g, '\\/')
    .replace(/\./g, '\\.')
    .replace(/%/g, '\\%')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/,/g, '\\,');
}

function extractClasses(html) {
  const classes = new Set();
  for (const match of html.matchAll(/class="([^"]+)"/g)) {
    for (const token of match[1].split(/\s+/).filter(Boolean)) classes.add(token);
  }
  return [...classes];
}

function tokenPrefixFromTheme(theme) {
  const counts = new Map();
  for (const match of theme.matchAll(/--([a-z][a-z0-9]*)-(?:color|radius)-[a-z0-9-]+\s*:/gi)) {
    const prefix = match[1].toLowerCase();
    counts.set(prefix, (counts.get(prefix) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'pif';
}

for (const file of required) {
  if (!fs.existsSync(path.join(tailwindRoot, file))) errors.push(`Missing Tailwind export file: ${tailwindDisplay}/${file}`);
}

let tokens = null;
if (fs.existsSync(path.join(tailwindRoot, 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(tailwindRoot, 'package.json'), 'utf8'));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (typeof pkg.version !== 'string' || !semverPattern.test(pkg.version)) errors.push(`export package.json version must be semantic version X.Y.Z, got ${JSON.stringify(pkg.version)}`);
  if (guideVersion && semverPattern.test(guideVersion) && pkg.version !== guideVersion) errors.push(`export package.json version ${pkg.version} must match guide version ${guideVersion}`);
  if (!deps.tailwindcss) errors.push('export package.json must depend on tailwindcss latest stable');
  if (deps.tailwindcss && deps.tailwindcss !== 'latest' && !String(deps.tailwindcss).startsWith('^4')) {
    errors.push(`tailwindcss dependency should target latest stable only, got ${deps.tailwindcss}`);
  }
}

if (fs.existsSync(path.join(tailwindRoot, 'src/tokens.json'))) {
  tokens = JSON.parse(fs.readFileSync(path.join(tailwindRoot, 'src/tokens.json'), 'utf8'));
  if (typeof tokens.version !== 'string' || !semverPattern.test(tokens.version)) errors.push(`tokens.json version must be semantic version X.Y.Z, got ${JSON.stringify(tokens.version)}`);
  if (guideVersion && semverPattern.test(guideVersion) && tokens.version !== guideVersion) errors.push(`tokens.json version ${tokens.version} must match guide version ${guideVersion}`);
  for (const family of ['colors', 'typography', 'fontWeights', 'lineHeightCategories', 'letterSpacing', 'spacing', 'radius', 'buttonIconSizes']) {
    if (!tokens[family] || typeof tokens[family] !== 'object') errors.push(`tokens.json missing token family: ${family}`);
  }
  if (tokens.prefix && !/^[a-z][a-z0-9]*$/.test(String(tokens.prefix))) errors.push(`tokens.json prefix should be lowercase alphanumeric, got ${JSON.stringify(tokens.prefix)}`);
  if (tokens.colors) {
    for (const [name, value] of Object.entries(tokens.colors)) {
      if (!String(value).startsWith('oklch(') && !String(value).startsWith('#') && !String(value).startsWith('rgb') && !String(value).startsWith('hsl')) {
        errors.push(`colors.${name} should use an explicit color format`);
      }
    }
    for (const [background, foreground] of [
      ['primary', 'primary-content'],
      ['secondary', 'secondary-content'],
      ['accent', 'accent-content'],
      ['neutral', 'neutral-content'],
      ['info', 'info-content'],
      ['success', 'success-content'],
      ['warning', 'warning-content'],
      ['error', 'error-content']
    ]) {
      if (!tokens.colors[background] || !tokens.colors[foreground]) continue;
      const bg = parseColor(tokens.colors[background]);
      const fg = parseColor(tokens.colors[foreground]);
      if (!bg || !fg) {
        errors.push(`Could not parse color pair ${background}/${foreground} for contrast validation`);
        continue;
      }
      const ratio = contrastRatio(bg, fg);
      if (ratio < 3) errors.push(`Color pair ${background}/${foreground} contrast ${ratio.toFixed(2)} is below 3:1`);
    }
  }
  for (const family of ['typography', 'spacing', 'buttonIconSizes']) {
    for (const [name, value] of Object.entries(tokens[family] || {})) {
      if (name.startsWith('font-')) continue;
      if (!/^0(?:\.0+)?rem$|^[0-9]+(?:\.[0-9]+)?rem$/.test(String(value))) errors.push(`${family}.${name} should use rem units`);
    }
  }
  for (const [name, value] of Object.entries(tokens.fontWeights || {})) {
    if (!/^\d{3}$/.test(String(value))) errors.push(`fontWeights.${name} should be numeric weight`);
  }
  for (const [name, value] of Object.entries(tokens.lineHeightCategories || {})) {
    if (!/^[0-9]+(?:\.[0-9]+)?$/.test(String(value))) errors.push(`lineHeightCategories.${name} should be unitless`);
  }
  for (const [name, value] of Object.entries(tokens.letterSpacing || {})) {
    if (!/^-?[0-9]+(?:\.[0-9]+)?em$/.test(String(value))) errors.push(`letterSpacing.${name} should use em units`);
  }
  for (const [name, value] of Object.entries(tokens.radius || {})) {
    if (!/^0(?:\.0+)?rem$|^[0-9]+(?:\.[0-9]+)?rem$|^[0-9]+px$/.test(String(value))) errors.push(`radius.${name} should use rem or px for full radius`);
  }
  if (fs.existsSync(path.join(tailwindRoot, 'src/theme.css'))) {
    const theme = fs.readFileSync(path.join(tailwindRoot, 'src/theme.css'), 'utf8');
    const prefix = tokens.prefix || tokenPrefixFromTheme(theme);
    for (const name of Object.keys(tokens.colors || {})) {
      if (!theme.includes(`--color-${name}:`)) errors.push(`theme.css missing color token: --color-${name}`);
    }
    for (const name of Object.keys(tokens.typography || {})) {
      if (name.startsWith('font-')) continue;
      if (!theme.includes(`--text-${name}:`)) errors.push(`theme.css missing typography token: --text-${name}`);
    }
    for (const name of Object.keys(tokens.fontWeights || {})) {
      if (!theme.includes(`--font-weight-${name}:`)) errors.push(`theme.css missing font weight token: --font-weight-${name}`);
    }
    for (const name of Object.keys(tokens.lineHeightCategories || {})) {
      if (!theme.includes(`--leading-${name}:`)) errors.push(`theme.css missing line-height token: --leading-${name}`);
    }
    for (const name of Object.keys(tokens.letterSpacing || {})) {
      if (!theme.includes(`--tracking-${name}:`)) errors.push(`theme.css missing letter-spacing token: --tracking-${name}`);
    }
    for (const name of Object.keys(tokens.radius || {})) {
      if (!theme.includes(`--radius-${name}:`)) errors.push(`theme.css missing radius token: --radius-${name}`);
    }
    for (const name of Object.keys(tokens.shadows || {})) {
      if (!theme.includes(`--shadow-${name}:`)) errors.push(`theme.css missing shadow token: --shadow-${name}`);
    }
    for (const name of Object.keys(tokens.spacing || {})) {
      if (!theme.includes(`--${prefix}-space-${name.replace('.', '-')}:`)) errors.push(`theme.css missing spacing alias: --${prefix}-space-${name.replace('.', '-')}`);
    }
    for (const name of Object.keys(tokens.buttonIconSizes || {})) {
      if (!theme.includes(`--${prefix}-button-icon-${name}:`)) errors.push(`theme.css missing button icon token: --${prefix}-button-icon-${name}`);
      if (!theme.includes(`@utility ${prefix}-icon-${name}`)) errors.push(`theme.css missing button icon utility: ${prefix}-icon-${name}`);
    }
    if (prefix !== 'mp' && /--mp-(?:space|button-icon)-|@utility\s+mp-icon-/i.test(theme)) {
      errors.push(`theme.css contains stale mp-prefixed spacing or icon utilities; expected ${prefix}-prefixed aliases`);
    }
  }
}

for (const file of required.filter((file) => fs.existsSync(path.join(tailwindRoot, file)))) {
  const text = fs.readFileSync(path.join(tailwindRoot, file), 'utf8');
  if (file !== 'dist/design-guide.css' && (text.includes('[') || text.includes(']'))) errors.push(`${tailwindDisplay}/${file}: contains square-bracket placeholder characters`);
  if (frameworkPattern.test(text)) errors.push(`${tailwindDisplay}/${file}: contains non-Tailwind framework contamination`);
  if (removedChapterPattern.test(text)) errors.push(`${tailwindDisplay}/${file}: contains stale removed-chapter reference`);
}

const inputCss = path.join(tailwindRoot, 'src/input.css');
if (fs.existsSync(inputCss) && /demo\/index\.html|\.\.\/index\.html/.test(fs.readFileSync(inputCss, 'utf8'))) {
  errors.push('Tailwind export input.css must not source demo HTML; demo CSS is generated separately under tmp/pif/demo');
}
const tempOutputDir = noWrite ? fs.mkdtempSync(path.join(os.tmpdir(), 'pif-validator-')) : null;
const outputCss = tempOutputDir ? path.join(tempOutputDir, 'validator.css') : path.join(tailwindRoot, 'dist/validator.css');
try {
  if (!errors.length && fs.existsSync(inputCss)) {
    fs.mkdirSync(path.dirname(outputCss), { recursive: true });
    const result = spawnSync('npx', ['tailwindcss', '-i', inputCss, '-o', outputCss], {
      cwd: tailwindRoot,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    if (result.status !== 0) {
      errors.push(`Tailwind build failed: ${result.stderr || result.stdout}`.trim());
    } else if (!fs.existsSync(outputCss) || fs.statSync(outputCss).size === 0) {
      errors.push('Tailwind build produced empty CSS output');
    } else {
      const css = fs.readFileSync(outputCss, 'utf8');
      const sourceFiles = [path.join(tailwindRoot, 'src/fixture.html')].filter((file) => fs.existsSync(file));
      const classes = new Set();
      for (const file of sourceFiles) {
        for (const className of extractClasses(fs.readFileSync(file, 'utf8'))) classes.add(className);
      }
      for (const className of classes) {
        if (className.includes('[') || className.includes(']')) errors.push(`Class ${className} uses arbitrary bracket syntax; prefer deterministic theme tokens`);
        const selector = `.${escapeSelectorClass(className)}`;
        if (!css.includes(selector)) errors.push(`Tailwind did not emit utility selector for class: ${className}`);
      }
    }
  }
} finally {
  if (tempOutputDir) fs.rmSync(tempOutputDir, { recursive: true, force: true });
}

if (errors.length) {
  console.error(`Tailwind export validation failed for ${tailwindRoot}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Tailwind export validation passed for ${tailwindRoot}`);
