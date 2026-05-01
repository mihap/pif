import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_GUIDE_VERSION = '0.1.0';
export const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function stripVersionLabel(value) {
  return String(value || '').trim().replace(/^Version\s+/i, '');
}

export function normalizeGuideVersion(value, fallback = DEFAULT_GUIDE_VERSION) {
  const clean = stripVersionLabel(value);
  if (!clean) return fallback;
  if (/^\d+\.\d+$/.test(clean)) return `${clean}.0`;
  return clean;
}

export function isGuideVersion(value) {
  return SEMVER_PATTERN.test(stripVersionLabel(value));
}

export function displayGuideVersion(value) {
  return `Version ${normalizeGuideVersion(value)}`;
}

export function readGuideVersion(guideRoot, fallback = DEFAULT_GUIDE_VERSION) {
  const manifestPath = path.join(guideRoot, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return fallback;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const version = normalizeGuideVersion(manifest.version, fallback);
    return isGuideVersion(version) ? version : fallback;
  } catch {
    return fallback;
  }
}
