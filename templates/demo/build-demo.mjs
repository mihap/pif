#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
function positionalArg(valueFlags = ['--out']) {
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
const outIndex = args.indexOf('--out');
const guideRoot = path.resolve(guideArg || process.cwd());
const here = path.dirname(fileURLToPath(import.meta.url));
const demoRoot = path.resolve(outIndex === -1 ? path.join(guideRoot, 'demo') : args[outIndex + 1]);
const dataPath = path.join(demoRoot, 'demo-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const renderData = withStandardCoverage(data);
if (outIndex !== -1) fs.writeFileSync(dataPath, `${JSON.stringify(renderData, null, 2)}\n`);

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function attrs(classes) {
  return esc(classes || '');
}

function normalizeSlashes(value) {
  return value.replace(/\\/g, '/');
}

function slug(value, fallback = 'item') {
  const text = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return text || fallback;
}

function productLabel(guideName = 'Product') {
  const cleaned = guideName
    .replace(/\bdesign\b/gi, ' ')
    .replace(/\bsystem\b/gi, ' ')
    .replace(/\bguidelines?\b/gi, ' ')
    .replace(/\bstyleguide\b/gi, ' ')
    .replace(/\bguide\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.split(' ')[0] || 'Product';
}

function initials(value = 'Product') {
  const words = String(value).match(/[A-Za-z0-9]+/g) || ['Product'];
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

function chapterHref(sourceChapter) {
  if (!sourceChapter) return '#';
  return normalizeSlashes(path.relative(demoRoot, path.join(guideRoot, sourceChapter))) || sourceChapter;
}

function readGuideMarkdown(sourceChapter) {
  if (!sourceChapter) return '';
  const filePath = path.join(guideRoot, sourceChapter);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function inlineMarkdown(value = '') {
  return esc(value).replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-base-content">$1</strong>');
}

function guideProseBlocks(sourceChapter, maxBlocks = 10) {
  const markdown = readGuideMarkdown(sourceChapter);
  if (!markdown) return [];
  const blocks = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push({ kind: 'list', items: list });
    list = [];
  };
  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim();
    if (!line || line === '---') {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^#\s+/.test(line)) continue;
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'heading', text: heading[1].trim() });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1].trim());
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks.slice(0, maxBlocks);
}

function normalizeExample(section, example) {
  const chapter = section.sourceChapter || '';
  if ((chapter.startsWith('04-') || section.id === 'layout-and-spacing') && example.type === 'spacing' && example.props?.items?.length) {
    return {
      ...example,
      title: example.title === 'Measured gaps' ? 'Spacing scale reference' : example.title,
      description: 'Maps Tailwind spacing utilities to the guide theme values used by layout, controls, and surfaces.'
    };
  }
  return example;
}

function mergeExamples(section, additions) {
  const currentExamples = (section.examples || []).map((example) => normalizeExample(section, example));
  const seen = new Set(currentExamples.map((example) => example.id));
  const merged = [...currentExamples];
  for (const addition of additions) {
    if (seen.has(addition.id)) continue;
    merged.push(addition);
    seen.add(addition.id);
  }
  return { ...section, examples: merged };
}

function withStandardCoverage(source) {
  return {
    ...source,
    sections: (source.sections || []).map((section) => mergeExamples(section, standardExamplesForSection(section, source)))
  };
}

function standardExamplesForSection(section, source) {
  const product = productLabel(source.guideName);
  const chapter = section.sourceChapter || '';
  const id = section.id || '';
  if (chapter.startsWith('01-') || id === 'design-philosophy') {
    return [
      {
        id: 'auto-guide-philosophy-prose',
        title: 'Current guide philosophy',
        description: 'The actual design-philosophy prose from the source guide, rendered as product-facing context before examples.',
        type: 'surface',
        tokens: [],
        props: { guideProse: guideProseBlocks(section.sourceChapter || '01-design-philosophy.md') }
      },
      {
        id: 'auto-product-screens',
        title: 'Full-page product synthesis',
        description: `Shows ${product} decisions composed into dashboard, rule-builder, and settings screens instead of isolated tokens.`,
        type: 'screen',
        tokens: ['bg-base-100', 'border-base-300', 'text-base-content', 'bg-primary', 'text-primary-content', 'bg-accent'],
        props: {
          wide: true,
          screens: [
            {
              kind: 'dashboard',
              eyebrow: 'Workspace',
              title: `${product} memory overview`,
              actionLabel: `Ask ${product}`,
              metrics: [
                { label: 'Indexed sources', value: '12,847', hint: '342 added today' },
                { label: 'Verified decisions', value: '418', hint: '94 percent linked' },
                { label: 'Review queue', value: '23', hint: '8 stale contexts', class: 'text-warning' },
                { label: 'Active graph paths', value: '7', hint: 'Current focus', class: 'text-accent' }
              ],
              queues: [
                { name: 'Claude sessions', value: 'Indexed', class: 'bg-success text-success-content' },
                { name: 'PR discussions', value: 'Review', class: 'bg-warning text-warning-content' },
                { name: 'Connector sync', value: 'Retry', class: 'bg-error text-error-content' }
              ],
              activity: [
                { title: 'Decision linked to source trail', text: 'Graph path REF-041 gained three verified references.', dot: 'bg-success' },
                { title: 'Uncertain summary flagged', text: 'Two sources disagree on rollout ownership.', dot: 'bg-warning' },
                { title: 'New topic cluster opened', text: 'Agent memory now connects to onboarding docs.', dot: 'bg-accent' }
              ]
            },
            {
              kind: 'rule-builder',
              title: 'Route source context',
              description: 'A static configuration flow demonstrates fields, preview output, alerts, and action hierarchy in one screen.',
              trigger: 'Source contains topic',
              condition: 'agent-memory',
              action: 'Link to related decision',
              primaryAction: 'Publish rule',
              secondaryAction: 'Preview rule'
            },
            {
              kind: 'settings',
              title: `${product} workspace settings`,
              fields: [
                { label: 'Workspace name', value: `${product} Graph` },
                { label: 'Default owner', value: 'Knowledge Ops' },
                { label: 'Source retention', value: '18 months' },
                { label: 'Review threshold', value: '0.72 confidence' }
              ],
              toggleLabel: 'Require provenance before answer',
              toggleHelper: 'Answers stay blocked until at least one source is linked.'
            }
          ]
        }
      },
      {
        id: 'auto-media-identity',
        title: 'Media and identity treatments',
        description: 'Shows image, caption, aspect-ratio placeholder, icon, and avatar treatments on the same square surface system.',
        type: 'surface',
        tokens: ['bg-base-200', 'border-base-300', 'rounded-full', 'bg-accent'],
        props: { mediaShowcase: true }
      }
    ];
  }
  if (chapter.startsWith('02-') || id === 'color-system') {
    return [
      {
        id: 'auto-applied-palette',
        title: 'Applied palette in context',
        description: 'Turns color tokens into real text, links, actions, semantic badges, disabled copy, and a current row.',
        type: 'color',
        tokens: ['text-base-content', 'text-accent', 'bg-primary', 'bg-success', 'bg-warning', 'bg-error'],
        props: { appliedPalette: true }
      }
    ];
  }
  if (chapter.startsWith('03-') || id === 'typography') {
    return [
      {
        id: 'auto-applied-article',
        title: 'Applied article and inline text',
        description: 'Shows headings, lead copy, links, emphasis, inline code, keyboard tags, quotation, code block, divider, and address text.',
        type: 'typography',
        tokens: ['text-h1', 'text-h3', 'text-body-large', 'text-body', 'font-mono'],
        props: { articleShowcase: true, product }
      },
      {
        id: 'auto-list-coverage',
        title: 'List and metadata structures',
        description: 'Shows bulleted, numbered, nested, plain, dense, and description-list treatments for common content blocks.',
        type: 'typography',
        tokens: ['space-y-2', 'list-disc', 'list-decimal', 'text-small'],
        props: { listShowcase: true }
      }
    ];
  }
  if (chapter.startsWith('04-') || id === 'layout-and-spacing') {
    return [
      {
        id: 'auto-applied-spacing',
        title: 'Applied rhythm',
        description: 'Shows the same spacing scale on a settings list, contact card, form row, and section stack.',
        type: 'spacing',
        tokens: ['gap-2', 'gap-3', 'gap-4', 'p-4', 'p-6'],
        props: { appliedRhythm: true }
      }
    ];
  }
  if (chapter.startsWith('05-') || id === 'border-radius') {
    return [
      {
        id: 'auto-radius-coverage',
        title: 'Approved radius exceptions',
        description: 'Makes chips, badges, avatars, progress fills, and search fields visible next to square structural panels.',
        type: 'surface',
        tokens: ['rounded-none', 'rounded-full', 'border-base-300', 'bg-primary'],
        props: { radiusShowcase: true }
      }
    ];
  }
  if (chapter.startsWith('06-') || id === 'shadows-and-elevation') {
    return [
      {
        id: 'auto-layered-surfaces',
        title: 'Layered planes, disclosure, and overlay states',
        description: 'Shows card, dropdown, native details, side panel, and open dialog treatments without soft shadows or scripting.',
        type: 'surface',
        tokens: ['shadow-none', 'border-base-300', 'bg-base-200', 'bg-neutral'],
        props: { layerStack: true, disclosureShowcase: true }
      }
    ];
  }
  if (chapter.startsWith('07-') || id === 'component-states') {
    return [
      {
        id: 'auto-cross-component-states',
        title: 'States across controls',
        description: 'Shows action, link, navigation, field, checkbox, radio, selected, loading, success, and error states in one static fixture.',
        type: 'state',
        tokens: ['ring-accent', 'bg-base-200', 'border-error', 'border-success', 'opacity-40'],
        props: {
          groups: [
            {
              title: 'Action states',
              states: [
                { label: 'Pressed', class: 'border border-primary bg-primary/85 px-4 py-2 text-sm font-medium text-primary-content translate-y-px' },
                { label: 'Loading', class: 'inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content pointer-events-none', icon: '•' },
                { label: 'Selected', class: 'border border-accent bg-accent/15 px-4 py-2 text-sm font-medium text-base-content' },
                { label: 'Error', class: 'border border-error bg-error/10 px-4 py-2 text-sm font-medium text-error' },
                { label: 'Success', class: 'border border-success bg-success/10 px-4 py-2 text-sm font-medium text-success' }
              ]
            }
          ],
          linkStates: true,
          fieldStates: true,
          selectionStates: true
        }
      }
    ];
  }
  if (chapter.startsWith('08-') || id === 'form-elements-and-selection-controls') {
    return [
      {
        id: 'auto-form-kitchen-sink',
        title: 'Form element kitchen sink',
        description: 'Covers text, email, phone, URL, search, password, number, date, time, file, range, color, textarea, select, autocomplete, checkbox, radio, segmented choices, and form output.',
        type: 'form',
        tokens: ['border-base-300', 'focus:ring-accent', 'text-error', 'text-success', 'accent-primary'],
        props: {
          wide: true,
          fields: [
            { label: 'Text input', value: 'Decision import', helper: 'Default square text field.' },
            { label: 'Email', type: 'email', value: 'ops@nexus.example', helper: 'Browser email type.' },
            { label: 'Phone', type: 'tel', value: '+1 555 0142', helper: 'Telephone field.' },
            { label: 'URL', type: 'url', value: 'https://docs.example/source', helper: 'URL field with validation semantics.' },
            { label: 'Search', type: 'search', value: 'agent memory', prefix: '⌕', helper: 'Search with leading icon slot.' },
            { label: 'Password', type: 'password', value: 'source-token', suffix: 'Show', helper: 'Credential field with trailing action slot.' },
            { label: 'Number', type: 'number', value: '72', suffix: '%', helper: 'Threshold or limit field.' },
            { label: 'Date', type: 'date', value: '2026-04-30', helper: 'Native date picker.' },
            { label: 'Time', type: 'time', value: '13:45', helper: 'Native time picker.' },
            { label: 'File upload', type: 'file', helper: 'Native file input for source import.' },
            { label: 'Range', type: 'range', value: '68', helper: 'Confidence slider.', min: '0', max: '100' },
            { label: 'Color', type: 'color', value: '#00d8ff', helper: 'Native color picker.' },
            { label: 'Source excerpt', kind: 'textarea', value: 'The rollout decision depends on verified source context and recent implementation notes.', helper: 'Multi-line textarea with resize.', full: true },
            { label: 'Status select', kind: 'select', value: 'Review needed', options: ['Indexed', 'Review needed', 'Retry import'], helper: 'Single-select dropdown.' },
            { label: 'Topic autocomplete', kind: 'autocomplete', value: 'agent-memory', suggestions: ['agent-memory', 'source-routing', 'review-threshold'], helper: 'Static suggestions show the open visual state.' },
            { label: 'Invalid required field', value: '', placeholder: 'Owner required', required: true, state: 'error', helper: 'Choose an owner before publishing.' },
            { label: 'Read-only source id', value: 'SRC-418', readonly: true, helper: 'Read-only fields use quiet filled treatment.' },
            { label: 'Disabled field', value: 'Locked by policy', disabled: true, helper: 'Disabled fields reduce emphasis.' }
          ],
          checkboxes: [
            { label: 'Include transcripts', checked: true },
            { label: 'Attach PR comments', checked: false },
            { label: 'Sync private notes', disabled: true }
          ],
          radios: [
            { label: 'Compact density', checked: false },
            { label: 'Default density', checked: true },
            { label: 'Comfortable density', checked: false }
          ],
          segmented: ['Graph', 'Table', 'Timeline'],
          toggles: [
            { label: 'Require review before publishing', helper: 'Toggle rows keep labels and state visible.', checked: true }
          ],
          outputs: true,
          actions: [
            { label: 'Save settings', class: 'border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content' },
            { label: 'Reset', class: 'border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content' }
          ]
        }
      }
    ];
  }
  if (chapter.startsWith('09-') || id === 'buttons') {
    return [
      {
        id: 'auto-button-anatomy',
        title: 'Button anatomy and icon placement',
        description: 'Shows text buttons, icon-left, icon-right, icon-only, link-style, loading, and pill filter treatments.',
        type: 'button',
        tokens: ['bg-primary', 'bg-secondary', 'bg-error', 'gap-2', 'rounded-full'],
        props: {
          buttons: [
            { label: 'Import sources', icon: '+', class: 'inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content' },
            { label: 'View source', icon: '↗', iconAfter: true, class: 'inline-flex items-center gap-2 border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content' },
            { label: 'Refreshing', icon: '•', class: 'inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content pointer-events-none' },
            { label: 'Inline source link', element: 'a', href: 'demo-top', class: 'text-sm font-medium text-accent underline underline-offset-2' },
            { label: 'Filter chip', class: 'rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content' }
          ],
          iconButtons: true
        }
      }
    ];
  }
  if (chapter.startsWith('10-') || id === 'navigation') {
    return [
      {
        id: 'auto-navigation-chrome',
        title: 'Page chrome and sectioning patterns',
        description: 'Shows header, search, actions, breadcrumbs, tabs, sidebar callout, native mobile disclosure, footer, and pagination.',
        type: 'navigation',
        tokens: ['border-base-300', 'bg-base-200', 'border-accent', 'text-accent'],
        props: { chromeShowcase: true, product }
      }
    ];
  }
  if (chapter.startsWith('11-') || id === 'tables-and-data-display') {
    return [
      {
        id: 'auto-heavy-table',
        title: 'Heavy data table coverage',
        description: 'Shows caption, filter, sort affordance, selection column, row headers, numeric alignment, status alignment, row actions, summary footer, pagination, and empty state.',
        type: 'table',
        tokens: ['bg-base-200', 'border-base-300', 'text-right', 'rounded-full'],
        props: {
          wide: true,
          caption: 'Source review queue',
          toolbar: true,
          selectable: true,
          actions: true,
          columns: [
            { key: 'source', label: 'Source', rowHeader: true },
            { key: 'owner', label: 'Owner' },
            { key: 'status', label: 'Status', badge: true, align: 'center' },
            { key: 'confidence', label: 'Confidence', align: 'right' },
            { key: 'age', label: 'Age', align: 'right' }
          ],
          rows: [
            { source: 'Claude Code session', owner: 'Knowledge Ops', status: 'Indexed', confidence: '0.94', age: '2h', badgeClass: 'bg-success text-success-content' },
            { source: 'GitHub PR thread', owner: 'Platform', status: 'Review', confidence: '0.68', age: '1d', badgeClass: 'bg-warning text-warning-content' },
            { source: 'Linear comment', owner: 'Support', status: 'Retry', confidence: '0.21', age: '3d', badgeClass: 'bg-error text-error-content' }
          ],
          footerRows: [{ source: 'Summary', owner: '3 owners', status: '3 states', confidence: '0.61 avg', age: '2d avg' }],
          pagination: true,
          emptyState: true
        }
      }
    ];
  }
  if (chapter.startsWith('12-') || id === 'feedback-and-alerts') {
    return [
      {
        id: 'auto-feedback-states',
        title: 'Status, loading, empty, and error states',
        description: 'Shows page banner, toast, badge set, skeleton rows, empty state, 404 placeholder, and inline form feedback.',
        type: 'feedback',
        tokens: ['bg-info', 'bg-success', 'bg-warning', 'bg-error', 'bg-base-200'],
        props: { fullFeedbackShowcase: true }
      }
    ];
  }
  return [];
}

function iconMarkup(item) {
  if (!item.icon) return esc(item.label);
  const icon = `<span aria-hidden="true" class="inline-flex h-4 w-4 items-center justify-center text-current">${esc(item.icon)}</span>`;
  const label = `<span>${esc(item.label)}</span>`;
  return item.iconAfter ? `${label}${icon}` : `${icon}${label}`;
}

function actionElement(item) {
  if (item.element === 'a') return `<a href="#${esc(item.href || 'demo-top')}" class="${attrs(item.class)}">${iconMarkup(item)}</a>`;
  if (item.element === 'input') {
    const name = slug(item.name || item.id || item.label, 'field');
    return `<input name="${esc(name)}" aria-label="${esc(item.label)}" class="${attrs(item.class)}" placeholder="${esc(item.placeholder || item.label)}" value="${esc(item.value || '')}">`;
  }
  const disabled = item.disabled ? ' disabled' : '';
  const type = item.buttonType || 'button';
  const buttonClass = item.disabled && !/\bcursor-/.test(item.class || '') ? `${item.class || ''} cursor-not-allowed` : item.class;
  return `<button type="${esc(type)}" class="${attrs(buttonClass)}"${disabled}>${iconMarkup(item)}</button>`;
}

function tokenChips(tokens = []) {
  if (!tokens.length) return '';
  const prefix = tokens.map((token) => String(token).match(/^--([a-z][a-z0-9]*)-/i)?.[1]).find(Boolean);
  const chips = `<div class="mt-3 flex flex-wrap gap-2" aria-label="Design tokens">${tokens.map((token) => `<span class="border border-base-300 bg-base-200 px-2 py-1 font-mono text-xs text-base-content/70">${esc(token)}</span>`).join('')}</div>`;
  const note = prefix ? `<p class="mt-2 text-xs leading-5 text-base-content/55"><span class="font-mono">--${esc(prefix)}-*</span> is this guide's CSS-variable namespace in the generated Tailwind theme; utility chips without <span class="font-mono">--</span> are Tailwind classes.</p>` : '';
  return `${chips}${note}`;
}

function renderBody(example) {
  const props = example.props || {};
  switch (example.type) {
    case 'color':
      return renderColor(props);
    case 'typography':
      return renderTypography(props);
    case 'spacing':
      return renderSpacing(props);
    case 'surface':
      return renderSurface(props);
    case 'state':
      return renderState(props);
    case 'form':
      return renderForm(props);
    case 'button':
      return renderButton(props);
    case 'navigation':
      return renderNavigation(props);
    case 'table':
      return renderTable(props);
    case 'feedback':
      return renderFeedback(props);
    case 'screen':
      return `<div class="space-y-6">${(props.screens || []).map(renderScreen).join('')}</div>`;
    default:
      return '<p class="text-sm text-base-content/60">No renderer configured.</p>';
  }
}

function renderColor(props) {
  const swatches = props.swatches?.length ? `<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">${props.swatches.map((item) => `<div class="border border-base-300"><div class="h-16 ${attrs(item.class)}"></div><div class="bg-base-100 p-3"><p class="text-sm font-semibold">${esc(item.name)}</p><p class="font-mono text-xs text-base-content/60">${esc(item.token)}</p></div></div>`).join('')}</div>` : '';
  const usage = props.usageRows?.length ? `<div class="overflow-x-auto border border-base-300"><table class="w-full text-left text-sm"><thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/60"><tr><th class="px-3 py-2">Use</th><th class="px-3 py-2">Example</th><th class="px-3 py-2">Rule</th></tr></thead><tbody class="divide-y divide-base-300 bg-base-100">${props.usageRows.map((item) => `<tr><td class="px-3 py-3 font-medium">${esc(item.name)}</td><td class="px-3 py-3"><span class="${attrs(item.class)}">${esc(item.text)}</span></td><td class="px-3 py-3 text-base-content/65">${esc(item.rule)}</td></tr>`).join('')}</tbody></table></div>` : '';
  const applied = props.appliedPalette ? `<div class="border border-base-300 bg-base-100 p-4"><div class="grid gap-4 lg:grid-cols-3"><div class="lg:col-span-2"><p class="text-xs font-semibold uppercase tracking-wider text-base-content/55">Applied palette</p><h4 class="mt-2 text-2xl font-semibold tracking-tight">Source-backed answer ready for review</h4><p class="mt-3 text-sm leading-6 text-base-content/70">Body copy stays neutral, while the <a href="#demo-top" class="font-medium text-accent underline underline-offset-2">active source link</a> and focus states use the accent. <span class="text-base-content/40">Disabled supporting text recedes without disappearing.</span></p><div class="mt-4 flex flex-wrap gap-2"><button type="button" class="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content">Primary action</button><button type="button" class="border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content">Secondary</button><button type="button" class="border border-error bg-error px-4 py-2 text-sm font-medium text-error-content">Destructive</button></div></div><div class="space-y-2"><span class="inline-flex rounded-full bg-info px-2 py-1 text-xs font-medium text-info-content">Info</span> <span class="inline-flex rounded-full bg-success px-2 py-1 text-xs font-medium text-success-content">Saved</span> <span class="inline-flex rounded-full bg-warning px-2 py-1 text-xs font-medium text-warning-content">Review</span> <span class="inline-flex rounded-full bg-error px-2 py-1 text-xs font-medium text-error-content">Failed</span><div class="mt-3 border border-base-300 text-sm"><div class="grid grid-cols-3 bg-base-200 px-3 py-2 text-xs uppercase tracking-wide text-base-content/60"><span>Source</span><span>Status</span><span>Use</span></div><div class="grid grid-cols-3 border-t border-accent bg-accent/10 px-3 py-2"><span>REF-041</span><span>Current</span><span class="text-accent">Active row</span></div><div class="grid grid-cols-3 border-t border-base-300 px-3 py-2 text-base-content/60"><span>REF-017</span><span>Idle</span><span>Neutral row</span></div></div></div></div></div>` : '';
  return `<div class="space-y-4">${swatches}${usage}${applied}</div>`;
}

function fontRole(item, index) {
  const label = String(item.label || '').toLowerCase();
  if (label.includes('mono') || index > 0) return 'Secondary font — code, references, timestamps, and compact metadata';
  return 'Primary font — headings, body copy, labels, navigation, and controls';
}

function renderTypography(props) {
  const fontStacks = props.fontStacks?.length ? `<div class="grid gap-3 md:grid-cols-2">${props.fontStacks.map((item, index) => `<div class="border-l border-base-300 bg-base-100 p-4"><p class="text-xs font-medium uppercase tracking-wide text-base-content/50">${esc(fontRole(item, index))}</p><p class="mt-2 ${attrs(item.class)}">${esc(item.text)}</p><p class="mt-2 text-sm leading-6 text-base-content/65">${esc(item.rule)}</p></div>`).join('')}</div>` : '';
  const samples = props.samples?.length ? `<div class="space-y-4">${props.samples.map((item) => `<div><p class="mb-1 text-xs font-medium uppercase tracking-wide text-base-content/50">${esc(item.label)}</p><p class="${attrs(item.class)}">${esc(item.text)}</p><p class="mt-1 text-xs text-base-content/60">${esc(item.rule || '')}</p></div>`).join('')}</div>` : '';
  const scale = props.scale?.length ? `<div class="overflow-x-auto border border-base-300"><table class="w-full text-left text-sm"><thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/60"><tr><th class="px-3 py-2">Token</th><th class="px-3 py-2">Size</th><th class="px-3 py-2">Example</th></tr></thead><tbody class="divide-y divide-base-300 bg-base-100">${props.scale.map((item) => `<tr><td class="px-3 py-3 font-medium">${esc(item.name)}</td><td class="px-3 py-3 text-base-content/65">${esc(item.size)}</td><td class="px-3 py-3"><span class="${attrs(item.class)}">${esc(item.text)}</span></td></tr>`).join('')}</tbody></table></div>` : '';
  const article = props.articleShowcase ? renderArticleShowcase(props.product || 'Product') : '';
  const lists = props.listShowcase ? renderListShowcase() : '';
  return `<div class="space-y-4">${fontStacks}${scale}${samples}${article}${lists}</div>`;
}

function renderArticleShowcase(product) {
  return `<article class="border border-base-300 bg-base-100 p-5"><p class="font-mono text-xs font-medium uppercase tracking-wider text-base-content/55">REF 2026.04 ARTICLE</p><h1 class="mt-3 text-4xl font-medium tracking-tight md:text-5xl">${esc(product)} source trail</h1><p class="mt-4 text-base leading-relaxed text-base-content/75">Lead copy explains the decision in readable prose before dense evidence appears.</p><p class="mt-4 text-sm leading-6 text-base-content/70">Body text can include a <a href="#demo-top" class="font-medium text-accent underline underline-offset-2">default body link</a>, a <a href="#demo-top" class="font-medium text-accent/80 underline underline-offset-2">hover-style link</a>, a <a href="#demo-top" class="font-medium text-primary underline underline-offset-2">visited-style link</a>, and a <a href="#demo-top" class="font-medium text-accent underline decoration-2 underline-offset-4 ring-2 ring-accent ring-offset-2 ring-offset-base-100">focus-style link</a>. It also shows <strong class="font-semibold">bold emphasis</strong>, <em>italic emphasis</em>, <mark class="bg-warning/30 px-1 text-base-content">highlighted text</mark>, <abbr title="retrieval augmented generation" class="border-b border-dotted border-base-content">RAG</abbr>, <q>inline quotation</q>, <cite class="text-base-content/60">citation</cite>, <code class="border border-base-300 bg-base-200 px-1 py-0.5 font-mono text-xs">ctx.source</code>, <kbd class="border border-base-300 bg-base-200 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>, H<sub>2</sub>O, and x<sup>2</sup>.</p><hr class="my-5 border-base-300"><blockquote class="border-l-2 border-accent bg-accent/10 p-4"><p class="text-sm leading-6">A system answer is only trusted when the source path remains visible.</p><footer class="mt-2 text-xs text-base-content/60">Knowledge Ops review note</footer></blockquote><pre class="mt-4 overflow-auto bg-neutral p-4 font-mono text-xs leading-5 text-neutral-content"><code>source.status = verified\nanswer.mode = provenance-first</code></pre><address class="mt-4 not-italic text-xs leading-5 text-base-content/60">${esc(product)} Knowledge Ops<br>42 Source Graph Way<br>Memory District</address><p class="mt-4 text-xs text-base-content/55">Caption text stays compact while remaining attached to the evidence block it describes.</p></article>`;
}

function renderListShowcase() {
  return `<div class="grid gap-4 lg:grid-cols-2"><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Bulleted and nested list</h4><ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-base-content/70"><li>Verify source freshness before publishing.</li><li>Link each answer to evidence.<ul class="mt-2 list-disc space-y-1 pl-5"><li>Session transcript</li><li>Pull request thread</li></ul></li><li>Keep unresolved conflicts visible.</li></ul></div><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Numbered sequence</h4><ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-base-content/70"><li>Import source.</li><li>Review extraction.</li><li>Publish verified answer.</li></ol></div><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Description list</h4><dl class="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm"><dt class="font-medium text-base-content/60">Owner</dt><dd class="col-span-2">Knowledge Ops</dd><dt class="font-medium text-base-content/60">Confidence</dt><dd class="col-span-2">0.94 verified</dd><dt class="font-medium text-base-content/60">Updated</dt><dd class="col-span-2">2026-04-30</dd></dl></div><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Plain dense list</h4><ul class="mt-3 divide-y divide-base-300 text-sm"><li class="py-2">Graph</li><li class="py-2">Decisions</li><li class="py-2">Sources</li></ul></div></div>`;
}

function spacingStep(item) {
  return String(item.name || item.class || '')
    .match(/(?:Token\s+|\bh-|\bw-|\bp-|\bgap-)([0-9]+(?:\.[0-9]+)?)/i)?.[1] || String(item.name || '').trim();
}

function renderSpacing(props) {
  const scale = (props.items || []).length ? `<div class="overflow-x-auto border border-base-300"><table class="w-full text-left text-sm"><thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/60"><tr><th class="px-3 py-2">Tailwind standard utility</th><th class="px-3 py-2">Theme value / override</th></tr></thead><tbody class="divide-y divide-base-300 bg-base-100">${(props.items || []).map((item) => { const step = spacingStep(item); return `<tr><td class="px-3 py-3 font-mono text-xs">p-${esc(step)} / gap-${esc(step)} / w-${esc(step)}</td><td class="px-3 py-3 text-base-content/70">${esc(item.value)}</td></tr>`; }).join('')}</tbody></table></div>` : '';
  const applied = props.appliedRhythm ? `<div class="grid gap-4 lg:grid-cols-3"><section class="border border-base-300 bg-base-100 p-4"><div class="mb-3 flex items-center justify-between gap-2"><h4 class="text-sm font-semibold">Settings list</h4><span class="rounded-full bg-base-200 px-2 py-1 text-xs">gap 2</span></div><div class="space-y-2"><div class="border border-base-300 p-3"><p class="text-sm font-medium">Answer mode</p><p class="mt-1 text-xs text-base-content/60">Source-backed only</p></div><div class="border border-base-300 p-3"><p class="text-sm font-medium">Review threshold</p><p class="mt-1 text-xs text-base-content/60">0.72 confidence</p></div></div></section><section class="border border-base-300 bg-base-100 p-6"><h4 class="text-sm font-semibold">Contact card</h4><p class="mt-3 text-sm leading-6 text-base-content/70">Comfortable padding creates readable scan rhythm while dense metadata stays compact.</p><div class="mt-4 flex flex-wrap gap-2"><span class="rounded-full bg-primary px-2 py-1 text-xs text-primary-content">Owner</span><span class="rounded-full bg-base-200 px-2 py-1 text-xs">Knowledge Ops</span></div></section><section class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Form row</h4><label class="mt-3 block"><span class="text-xs font-medium">Query label</span><input name="spacing-query" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100" value="topic:source-routing"><span class="mt-1.5 block text-xs text-base-content/60">Helper text uses the same local rhythm.</span></label></section></div>` : '';
  return `<div class="space-y-4">${scale}${applied}</div>`;
}

function renderGuideProse(blocks = []) {
  if (!blocks.length) return '';
  const body = blocks.map((block) => {
    if (block.kind === 'heading') return `<h4 class="mt-5 text-lg font-semibold first:mt-0">${inlineMarkdown(block.text)}</h4>`;
    if (block.kind === 'list') return `<ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-base-content/75">${(block.items || []).map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`;
    return `<p class="mt-3 text-sm leading-6 text-base-content/75">${inlineMarkdown(block.text)}</p>`;
  }).join('');
  return `<article class="border border-base-300 bg-base-100 p-5">${body}</article>`;
}

function renderSurfaceCard(item) {
  const itemClass = attrs(item.class);
  const isPill = /\brounded-full\b/.test(item.class || '');
  if (isPill) {
    return `<div class="border border-base-300 bg-base-100 p-4"><div class="flex min-h-16 items-center justify-center"><span class="inline-flex items-center justify-center rounded-full border border-base-300 bg-base-200 px-4 py-2 text-center text-sm font-medium text-base-content">${esc(item.title)}</span></div><p class="mt-3 text-center text-sm text-base-content/65">${esc(item.text)}</p></div>`;
  }
  return `<div class="${itemClass}"><p class="text-sm font-semibold">${esc(item.title)}</p><p class="mt-1 text-sm opacity-75">${esc(item.text)}</p></div>`;
}

function renderSurface(props) {
  const prose = props.guideProse?.length ? renderGuideProse(props.guideProse) : '';
  const cards = props.cards?.length ? `<div class="grid gap-3 md:grid-cols-2">${props.cards.map(renderSurfaceCard).join('')}</div>` : '';
  const radius = props.radiusShowcase ? renderRadiusShowcase() : '';
  const layers = props.layerStack ? renderLayerShowcase() : '';
  const media = props.mediaShowcase ? renderMediaShowcase() : '';
  const disclosure = props.disclosureShowcase ? renderDisclosureShowcase() : '';
  return `<div class="space-y-4">${prose}${cards}${radius}${layers}${media}${disclosure}</div>`;
}

function renderRadiusShowcase() {
  return `<div class="grid gap-4 lg:grid-cols-2"><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Square structural elements</h4><div class="mt-3 grid gap-3"><div class="border border-base-300 p-3 text-sm">Square card and panel edge</div><label class="block"><span class="text-xs font-medium">Square search field</span><input name="radius-search" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" value="graph path"></label></div></div><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Full-radius exceptions</h4><div class="mt-3 flex flex-wrap gap-2"><span class="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-content">Primary chip</span><span class="rounded-full bg-success px-3 py-1 text-xs font-medium text-success-content">Verified</span><span class="rounded-full border border-base-300 px-3 py-1 text-xs font-medium">Outline badge</span></div><div class="mt-4 flex -space-x-2"><span class="flex h-10 w-10 items-center justify-center rounded-full border border-base-100 bg-primary text-sm font-semibold text-primary-content">KO</span><span class="flex h-10 w-10 items-center justify-center rounded-full border border-base-100 bg-accent text-sm font-semibold text-accent-content">AI</span><span class="flex h-10 w-10 items-center justify-center rounded-full border border-base-100 bg-base-200 text-sm font-semibold">+3</span></div><div class="mt-4"><p class="mb-1 text-xs font-medium">Progress fill</p><div class="h-2 bg-base-200"><div class="h-2 w-2/3 rounded-full bg-primary"></div></div></div></div></div>`;
}

function renderLayerShowcase() {
  return `<div class="border border-base-300 bg-base-200 p-4"><div class="border border-base-300 bg-base-100 p-4"><div class="mb-3 flex items-start justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-wide text-base-content/55">Layer stack</p><h4 class="text-lg font-semibold">Base card with raised menu</h4></div><div class="border border-base-300 bg-base-100 px-3 py-2 text-xs">z-20 dropdown</div></div><div class="grid gap-4 lg:grid-cols-2"><div class="border border-base-300 bg-base-100 p-4"><p class="text-sm font-medium">Bordered card</p><p class="mt-2 text-sm text-base-content/65">The base plane separates with a hairline and background step.</p><div class="mt-4 border border-base-300 bg-base-100 p-2 text-sm"><div class="bg-base-200 px-3 py-2">Dropdown item</div><div class="px-3 py-2">Second item</div></div></div><div class="border border-neutral bg-neutral/10 p-4"><dialog open class="static m-0 w-full border border-base-300 bg-base-100 p-0 text-base-content"><div class="border-b border-base-300 p-4"><h5 class="text-sm font-semibold">Open modal dialog</h5></div><p class="p-4 text-sm text-base-content/70">The dialog keeps square edges, border hierarchy, and neutral backdrop treatment.</p><div class="flex gap-2 border-t border-base-300 p-4"><button type="button" class="border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-content">Confirm</button><button type="button" class="border border-base-300 bg-base-100 px-3 py-2 text-sm font-medium">Cancel</button></div></dialog></div></div></div></div>`;
}

function renderDisclosureShowcase() {
  return `<div class="grid gap-4 lg:grid-cols-2"><details class="border border-base-300 bg-base-100 p-4"><summary class="cursor-pointer text-sm font-semibold">Closed disclosure</summary><p class="mt-3 text-sm text-base-content/65">Closed state keeps summary text visible and content hidden by default.</p></details><details open class="border border-base-300 bg-base-100 p-4"><summary class="cursor-pointer text-sm font-semibold">Open disclosure</summary><div class="mt-3 border-l border-base-300 pl-3 text-sm text-base-content/70"><p>Open state exposes nested evidence.</p><details open class="mt-3 border border-base-300 bg-base-200 p-3"><summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide">Nested source</summary><p class="mt-2 text-xs">Nested disclosure inherits the same border rhythm.</p></details></div></details></div>`;
}

function renderMediaShowcase() {
  const imageSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23EFEAE0'/%3E%3Cpath d='M80 260 L220 110 L340 210 L460 90 L560 170' fill='none' stroke='%2300D8FF' stroke-width='12'/%3E%3Ccircle cx='220' cy='110' r='18' fill='%23111111'/%3E%3Ccircle cx='460' cy='90' r='18' fill='%23111111'/%3E%3C/svg%3E";
  return `<div class="grid gap-4 lg:grid-cols-3"><figure class="border border-base-300 bg-base-100 p-3"><img src="${imageSrc}" alt="Abstract graph path" class="h-auto w-full border border-base-300"><figcaption class="mt-2 text-xs text-base-content/60">Image with caption and graph accent.</figcaption></figure><div class="border border-base-300 bg-base-100 p-3"><div class="flex aspect-video items-center justify-center border border-dashed border-base-300 bg-base-200 text-xs uppercase tracking-wide text-base-content/55">Aspect placeholder</div><div class="mt-3 grid grid-cols-3 gap-2"><div class="h-16 border border-base-300 bg-base-200"></div><div class="h-16 border border-base-300 bg-accent/15"></div><div class="h-16 border border-base-300 bg-base-200"></div></div></div><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Avatars and inline icons</h4><div class="mt-3 flex items-center gap-3"><span class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-content">KO</span><span class="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-content">AI</span><span class="flex h-12 w-12 items-center justify-center rounded-full bg-base-200">+5</span></div><button type="button" class="mt-4 inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-content"><span aria-hidden="true">↗</span><span>Open graph</span></button></div></div>`;
}

function renderState(props) {
  const groups = props.groups || [{ title: '', states: props.states || [] }];
  const groupMarkup = groups.map((group) => `<div><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">${esc(group.title)}</p><div class="flex flex-wrap items-center gap-3">${(group.states || []).map(actionElement).join('')}</div></div>`).join('');
  const links = props.linkStates ? `<div><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">Link states</p><div class="flex flex-wrap gap-4 text-sm"><a href="#demo-top" class="text-accent underline underline-offset-2">Default link</a><a href="#demo-top" class="text-accent/80 underline underline-offset-2">Hover style</a><a href="#demo-top" class="text-primary underline underline-offset-2">Visited style</a><a href="#demo-top" class="text-accent underline decoration-2 underline-offset-4 ring-2 ring-accent ring-offset-2 ring-offset-base-100">Focus style</a></div></div>` : '';
  const fields = props.fieldStates ? `<div><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">Field states</p><div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4"><label class="block"><span class="text-xs font-medium">Default</span><input name="state-default" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm" value="Ready"></label><label class="block"><span class="text-xs font-medium">Focus</span><input name="state-focus" class="mt-1.5 h-10 w-full border border-accent bg-base-100 px-3 text-sm ring-2 ring-accent ring-offset-2 ring-offset-base-100" value="Focused"></label><label class="block"><span class="text-xs font-medium">Invalid</span><input name="state-invalid" class="mt-1.5 h-10 w-full border border-error bg-base-100 px-3 text-sm" value="Missing owner"><span class="mt-1.5 block text-xs text-error">Owner is required.</span></label><label class="block"><span class="text-xs font-medium">Success</span><input name="state-success" class="mt-1.5 h-10 w-full border border-success bg-base-100 px-3 text-sm" value="Verified"><span class="mt-1.5 block text-xs text-success">Source verified.</span></label></div></div>` : '';
  const selection = props.selectionStates ? `<div><p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">Selection controls</p><div class="grid gap-3 md:grid-cols-2"><label class="flex min-h-10 items-center gap-3 border border-base-300 bg-base-100 px-3 py-2 text-sm"><input name="state-checkbox" type="checkbox" class="h-4 w-4 accent-primary" checked> Checked checkbox</label><label class="flex min-h-10 items-center gap-3 border border-base-300 bg-base-100 px-3 py-2 text-sm"><input name="state-radio" type="radio" class="h-4 w-4 accent-primary" checked> Selected radio</label><div class="border-l-2 border-accent bg-accent/10 px-3 py-2 text-sm font-medium">Current navigation item</div><div class="border border-base-300 bg-base-200 px-3 py-2 text-sm text-base-content/40">Disabled option</div></div></div>` : '';
  return `<div class="space-y-4">${groupMarkup}${links}${fields}${selection}</div>`;
}

function fieldClass(field = {}) {
  const border = field.state === 'error' ? 'border-error focus:ring-error' : field.state === 'success' ? 'border-success focus:ring-success' : 'border-base-300 focus:ring-accent';
  const bg = field.disabled || field.readonly ? 'bg-base-200 text-base-content/60' : 'bg-base-100 text-base-content';
  const cursor = field.disabled ? 'cursor-not-allowed' : '';
  const height = field.type === 'file' ? 'min-h-10 py-2' : field.type === 'range' ? 'h-10 py-2 accent-primary' : field.type === 'color' ? 'h-10 p-1' : 'h-10 px-3';
  return `mt-1.5 w-full border ${border} ${bg} ${height} text-sm placeholder:text-base-content/45 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 ${cursor}`.trim();
}

function supportText(field = {}) {
  const helper = field.helper || '';
  const color = field.state === 'error' ? 'text-error' : field.state === 'success' ? 'text-success' : 'text-base-content/60';
  const counter = field.counter ? `<span class="font-mono text-base-content/50">${esc(field.counter)}</span>` : '';
  if (!helper && !counter) return '';
  return `<span class="mt-1.5 flex justify-between gap-3 text-xs ${color}"><span>${esc(helper)}</span>${counter}</span>`;
}

function labelText(field) {
  const required = field.required ? '<span class="ml-1 text-error">*</span>' : '';
  const optional = field.optional ? '<span class="ml-1 text-base-content/50">Optional</span>' : '';
  return `<span class="text-xs font-medium text-base-content">${esc(field.label)}${required}${optional}</span>`;
}

function renderInputWithSlots(field, id, name) {
  if (!field.prefix && !field.suffix) {
    return `<input id="${esc(id)}" name="${esc(name)}" type="${esc(field.type || 'text')}" class="${fieldClass(field)}" placeholder="${esc(field.placeholder || '')}" value="${esc(field.value || '')}"${field.disabled ? ' disabled' : ''}${field.readonly ? ' readonly' : ''}${field.required ? ' required' : ''}${field.min ? ` min="${esc(field.min)}"` : ''}${field.max ? ` max="${esc(field.max)}"` : ''}>`;
  }
  return `<div class="mt-1.5 flex h-10 items-center border ${field.state === 'error' ? 'border-error' : 'border-base-300'} bg-base-100 px-3 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-base-100">${field.prefix ? `<span class="mr-2 text-sm text-base-content/50">${esc(field.prefix)}</span>` : ''}<input id="${esc(id)}" name="${esc(name)}" type="${esc(field.type || 'text')}" class="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="${esc(field.placeholder || '')}" value="${esc(field.value || '')}">${field.suffix ? `<span class="ml-2 text-xs font-medium text-base-content/60">${esc(field.suffix)}</span>` : ''}</div>`;
}

function renderFormField(field, index) {
  const id = slug(field.id || field.name || field.label, `field-${index + 1}`);
  const name = slug(field.name || field.label, `field-${index + 1}`);
  const span = field.full ? ' md:col-span-2' : '';
  if (field.kind === 'textarea') {
    return `<label for="${esc(id)}" class="block${span}">${labelText(field)}<textarea id="${esc(id)}" name="${esc(name)}" rows="5" class="mt-1.5 min-h-32 w-full resize-y border ${field.state === 'error' ? 'border-error' : 'border-base-300'} bg-base-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100" placeholder="${esc(field.placeholder || '')}">${esc(field.value || '')}</textarea>${supportText(field)}</label>`;
  }
  if (field.kind === 'select') {
    const options = field.options?.length ? field.options : [field.value || 'Option'];
    return `<label for="${esc(id)}" class="block${span}">${labelText(field)}<select id="${esc(id)}" name="${esc(name)}" class="${fieldClass(field)}">${options.map((option) => `<option${option === field.value ? ' selected' : ''}>${esc(option)}</option>`).join('')}</select>${supportText(field)}</label>`;
  }
  if (field.kind === 'autocomplete') {
    const suggestions = field.suggestions || [];
    return `<label for="${esc(id)}" class="block${span}">${labelText(field)}${renderInputWithSlots(field, id, name)}<div class="border-x border-b border-base-300 bg-base-100 text-sm">${suggestions.map((suggestion, suggestionIndex) => `<div class="px-3 py-2 ${suggestionIndex === 0 ? 'bg-accent/10 text-base-content' : 'text-base-content/70'}">${esc(suggestion)}</div>`).join('')}</div>${supportText(field)}</label>`;
  }
  return `<label for="${esc(id)}" class="block${span}">${labelText(field)}${renderInputWithSlots(field, id, name)}${supportText(field)}</label>`;
}

function renderForm(props) {
  const fields = props.fields?.length ? props.fields : [
    { label: 'Source query', value: 'topic:organizational-memory', helper: 'Use a query, identifier, or reference path.' }
  ];
  const toggles = props.toggles || [];
  const actions = props.actions || [];
  const fieldMarkup = fields.map(renderFormField).join('');
  const toggleMarkup = toggles.map((toggle, index) => {
    const id = slug(toggle.id || toggle.name || toggle.label, `toggle-${index + 1}`);
    const name = slug(toggle.name || toggle.label, `toggle-${index + 1}`);
    const checked = toggle.checked === false ? '' : ' checked';
    return `<label for="${esc(id)}" class="flex items-center justify-between gap-4 border border-base-300 bg-base-100 p-3"><span class="min-w-0"><span class="block text-sm font-medium">${esc(toggle.label)}</span>${toggle.helper ? `<span class="text-xs text-base-content/60">${esc(toggle.helper)}</span>` : ''}</span><input id="${esc(id)}" name="${esc(name)}" type="checkbox" class="sr-only"${checked}><span aria-hidden="true" class="h-6 w-10 shrink-0 rounded-full bg-primary p-1"><span class="block h-4 w-4 translate-x-5 rounded-full bg-primary-content"></span></span></label>`;
  }).join('');
  const checkboxMarkup = props.checkboxes?.length ? `<fieldset class="border border-base-300 bg-base-100 p-4"><legend class="px-1 text-xs font-medium">Checkbox group</legend><div class="mt-2 space-y-2">${props.checkboxes.map((item, index) => `<label class="flex min-h-10 items-center gap-3 text-sm"><input name="checkbox-${index + 1}" type="checkbox" class="h-4 w-4 accent-primary"${item.checked ? ' checked' : ''}${item.disabled ? ' disabled' : ''}> <span class="${item.disabled ? 'text-base-content/40' : ''}">${esc(item.label)}</span></label>`).join('')}</div></fieldset>` : '';
  const radioMarkup = props.radios?.length ? `<fieldset class="border border-base-300 bg-base-100 p-4"><legend class="px-1 text-xs font-medium">Radio group</legend><div class="mt-2 space-y-2">${props.radios.map((item, index) => `<label class="flex min-h-10 items-center gap-3 text-sm"><input name="radio-group" type="radio" class="h-4 w-4 accent-primary"${item.checked ? ' checked' : ''}> ${esc(item.label)}</label>`).join('')}</div></fieldset>` : '';
  const segmented = props.segmented?.length ? `<fieldset class="border border-base-300 bg-base-100 p-4"><legend class="px-1 text-xs font-medium">Segmented choices</legend><div class="mt-3 inline-flex rounded-full border border-base-300 bg-base-100 p-1">${props.segmented.map((item, index) => `<label class="cursor-pointer"><input name="segmented" type="radio" class="sr-only"${index === 0 ? ' checked' : ''}><span class="block rounded-full px-3 py-1.5 text-sm font-medium ${index === 0 ? 'bg-primary text-primary-content' : 'text-base-content/70'}">${esc(item)}</span></label>`).join('')}</div></fieldset>` : '';
  const outputs = props.outputs ? `<div class="border border-base-300 bg-base-100 p-4 md:col-span-2"><h4 class="text-sm font-semibold">Form output</h4><div class="mt-3 grid gap-4 md:grid-cols-2"><label class="block"><span class="text-xs font-medium">Import progress</span><progress class="mt-2 h-2 w-full accent-primary" value="68" max="100">68 percent</progress><span class="mt-1.5 block text-xs text-base-content/60">Determinate progress bar.</span></label><label class="block"><span class="text-xs font-medium">Confidence gauge</span><meter class="mt-2 h-2 w-full" min="0" max="1" low="0.4" high="0.8" optimum="0.9" value="0.72">0.72</meter><span class="mt-1.5 block text-xs text-base-content/60">Native measurement gauge.</span></label></div></div>` : '';
  const actionMarkup = actions.length ? `<div class="flex flex-wrap gap-2 md:col-span-2">${actions.map(actionElement).join('')}</div>` : '';
  return `<form class="grid gap-4 md:grid-cols-2">${fieldMarkup}${toggleMarkup}${checkboxMarkup}${radioMarkup}${segmented}${outputs}${actionMarkup}</form>`;
}

function renderButton(props) {
  const buttons = props.buttons?.length ? `<div class="flex flex-wrap items-center gap-3">${props.buttons.map(actionElement).join('')}</div>` : '';
  const icons = props.iconSizes?.length ? `<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${props.iconSizes.map((item) => `<div class="border border-base-300 bg-base-100 p-3"><button type="button" aria-label="${esc(item.name)} icon-only action" class="flex h-11 w-11 items-center justify-center border border-base-300 bg-base-100"><span class="${attrs(item.class)} inline-flex items-center justify-center text-base-content">↗</span></button><p class="mt-3 text-sm font-medium">${esc(item.name)} icon-only action</p><p class="mt-1 text-xs text-base-content/60">Icon token ${esc(item.value)} inside a fixed hit area.</p></div>`).join('')}</div>` : '';
  const iconButtons = props.iconButtons ? `<div class="mt-4 flex flex-wrap items-center gap-3"><button type="button" aria-label="Open source" class="flex h-7 w-7 items-center justify-center border border-base-300 bg-base-100 text-xs">↗</button><button type="button" aria-label="Dismiss" class="flex h-9 w-9 items-center justify-center border border-base-300 bg-base-100 text-sm">×</button><button type="button" aria-label="More actions" class="flex h-11 w-11 items-center justify-center border border-primary bg-primary text-primary-content">•••</button><button type="button" class="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium">Pill choice</button></div>` : '';
  return `<div>${buttons}${icons}${iconButtons}</div>`;
}

function renderNavigation(props) {
  const product = props.product || 'Product';
  const mark = initials(product);
  const rail = (props.items || []).length ? `<nav class="space-y-1" aria-label="Example navigation">${(props.items || []).map((item) => `<a class="${attrs(item.class)}" href="#${esc(item.href || 'navigation')}">${esc(item.label)}<span class="ml-auto rounded-full bg-base-200 px-2 py-0.5 text-xs">${esc(item.count || '')}</span></a>`).join('')}</nav>` : '';
  const chrome = props.chromeShowcase ? `<div class="space-y-4"><header class="flex flex-col gap-3 border border-base-300 bg-base-100 p-4 lg:flex-row lg:items-center lg:justify-between"><div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center border border-primary bg-primary text-sm font-semibold text-primary-content">${esc(mark)}</span><div><p class="text-sm font-semibold">${esc(product)}</p><p class="text-xs text-base-content/60">Knowledge graph</p></div></div><label class="min-w-0 flex-1 lg:max-w-md"><span class="sr-only">Search workspace</span><input name="nav-search" type="search" class="h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" value="Search sources"></label><div class="flex gap-2"><button type="button" class="border border-base-300 bg-base-100 px-3 py-2 text-sm font-medium">Command</button><button type="button" class="border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-content">Ask</button></div></header><nav aria-label="Breadcrumb" class="border border-base-300 bg-base-100 px-4 py-3 text-sm"><ol class="flex flex-wrap items-center gap-2 text-base-content/60"><li><a href="#demo-top" class="text-accent underline underline-offset-2">Graph</a></li><li>/</li><li><a href="#demo-top" class="text-accent underline underline-offset-2">Decisions</a></li><li>/</li><li class="text-base-content">REF-041</li></ol></nav><div class="border border-base-300 bg-base-100"><div class="flex overflow-x-auto border-b border-base-300 text-sm"><a href="#demo-top" class="border-b-2 border-accent px-4 py-3 font-medium text-base-content">Overview</a><a href="#demo-top" class="border-b-2 border-transparent px-4 py-3 text-base-content/70">Sources</a><a href="#demo-top" class="border-b-2 border-transparent px-4 py-3 text-base-content/70">Activity</a></div><aside class="m-4 border-l-2 border-accent bg-accent/10 p-4 text-sm text-base-content/70">Sidebar callout keeps contextual guidance near the article.</aside></div><details class="border border-base-300 bg-base-100 p-4"><summary class="cursor-pointer text-sm font-semibold">Mobile navigation disclosure</summary><nav class="mt-3 grid gap-1 text-sm"><a href="#demo-top" class="bg-accent/10 px-3 py-2">Graph</a><a href="#demo-top" class="px-3 py-2">Decisions</a><a href="#demo-top" class="px-3 py-2">Sources</a></nav></details><footer class="grid gap-4 border border-base-300 bg-base-200 p-4 text-sm md:grid-cols-3"><div><p class="font-semibold">${esc(product)}</p><p class="mt-1 text-xs text-base-content/60">Footer meta line and product provenance.</p></div><div><p class="font-medium">Product</p><a href="#demo-top" class="mt-1 block text-base-content/70">Graph</a><a href="#demo-top" class="block text-base-content/70">Sources</a></div><div><p class="font-medium">Pagination</p><div class="mt-2 flex items-center gap-2"><button type="button" class="border border-base-300 bg-base-100 px-2 py-1 text-xs">Previous</button><span class="text-xs text-base-content/60">1 to 25 of 418</span><button type="button" class="border border-base-300 bg-base-100 px-2 py-1 text-xs">Next</button></div></div></footer></div>` : '';
  return `<div class="space-y-4">${rail}${chrome}</div>`;
}

function renderTable(props) {
  const rows = props.rows || [];
  const baseColumns = props.columns?.length ? props.columns : [
    { key: 'sender', label: 'Source' },
    { key: 'status', label: 'Status', badge: true },
    { key: 'sla', label: 'Time', align: 'right' }
  ];
  const columns = [
    ...(props.selectable ? [{ key: '__select', label: '', align: 'center', select: true }] : []),
    ...baseColumns,
    ...(props.actions ? [{ key: '__actions', label: '', align: 'right', action: true }] : [])
  ];
  const align = (column) => column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
  const toolbar = props.toolbar ? `<div class="flex flex-col gap-3 border border-b-0 border-base-300 bg-base-100 p-3 md:flex-row md:items-center md:justify-between"><label class="block md:w-80"><span class="sr-only">Filter table</span><input name="table-filter" class="h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" value="filter:needs-review"></label><div class="flex gap-2"><button type="button" class="border border-base-300 bg-base-100 px-3 py-2 text-sm">Export</button><button type="button" class="border border-primary bg-primary px-3 py-2 text-sm text-primary-content">Import</button></div></div>` : '';
  const caption = props.caption ? `<caption class="caption-top bg-base-100 px-3 py-2 text-left text-sm font-semibold">${esc(props.caption)}</caption>` : '';
  const header = columns.map((column) => {
    if (column.select) return '<th class="w-10 px-3 py-2 text-center"><input type="checkbox" aria-label="Select all rows" class="h-4 w-4 accent-primary"></th>';
    if (column.action) return `<th class="px-3 py-2 ${align(column)}"><span class="sr-only">Row actions</span></th>`;
    const sort = column.rowHeader || column.align === 'right' ? '<span aria-hidden="true" class="ml-1 text-base-content/40">↕</span>' : '';
    return `<th class="px-3 py-2 ${align(column)}">${esc(column.label || column.key)}${sort}</th>`;
  }).join('');
  const bodyRows = rows.map((row, rowIndex) => `<tr class="${rowIndex === 1 ? 'bg-accent/10' : ''}">${columns.map((column) => {
    const value = row[column.key] ?? '';
    const cellClass = `px-3 py-3 ${align(column)} ${column.class || ''}`.trim();
    if (column.select) return `<td class="${attrs(cellClass)}"><input type="checkbox" aria-label="Select ${esc(row.source || row.sender || `row ${rowIndex + 1}`)}" class="h-4 w-4 accent-primary"${rowIndex === 1 ? ' checked' : ''}></td>`;
    if (column.action) return `<td class="${attrs(cellClass)}"><button type="button" aria-label="Open row actions" class="border border-base-300 bg-base-100 px-2 py-1 text-xs">•••</button></td>`;
    if (column.badge || column.key === 'status') return `<td class="${attrs(cellClass)}"><span class="rounded-full ${attrs(row.badgeClass || column.badgeClass || 'bg-base-200 text-base-content')} px-2 py-1 text-xs font-medium">${esc(value)}</span></td>`;
    if (column.rowHeader) return `<th scope="row" class="${attrs(cellClass)} font-medium">${esc(value)}</th>`;
    return `<td class="${attrs(cellClass)}">${esc(value)}</td>`;
  }).join('')}</tr>`).join('');
  const empty = props.emptyState ? `<tr><td colspan="${columns.length}" class="bg-base-100 px-3 py-8 text-center text-sm text-base-content/60"><div class="mx-auto max-w-sm"><p class="font-medium text-base-content">No matching sources</p><p class="mt-1">Reset filters or import a source to fill this table state.</p><button type="button" class="mt-3 border border-primary bg-primary px-3 py-2 text-sm text-primary-content">Reset filters</button></div></td></tr>` : '';
  const footerRows = (props.footerRows || []).map((row) => `<tr>${columns.map((column) => {
    if (column.select || column.action) return `<td class="px-3 py-3 ${align(column)}"></td>`;
    return `<td class="px-3 py-3 ${align(column)} font-medium">${esc(row[column.key] || '')}</td>`;
  }).join('')}</tr>`).join('');
  const footer = footerRows ? `<tfoot class="border-t border-base-300 bg-base-200 text-sm">${footerRows}</tfoot>` : '';
  const pagination = props.pagination ? `<div class="flex flex-col gap-2 border border-t-0 border-base-300 bg-base-100 px-3 py-3 text-sm md:flex-row md:items-center md:justify-between"><span class="text-base-content/60">Showing 1 to 3 of 418 sources</span><div class="flex gap-2"><button type="button" class="border border-base-300 bg-base-100 px-3 py-1.5">Previous</button><button type="button" class="border border-base-300 bg-base-100 px-3 py-1.5">Next</button></div></div>` : '';
  return `<div>${toolbar}<div class="overflow-x-auto border border-base-300"><table class="w-full text-sm">${caption}<thead class="bg-base-200 text-xs uppercase tracking-wider text-base-content/60"><tr>${header}</tr></thead><tbody class="divide-y divide-base-300 bg-base-100">${bodyRows}${empty}</tbody>${footer}</table></div>${pagination}</div>`;
}

function renderFeedback(props) {
  const alerts = props.alerts?.length ? `<div class="grid gap-3 md:grid-cols-2">${props.alerts.map((item) => `<div class="${attrs(item.class)}"><p class="text-sm font-semibold">${esc(item.title)}</p><p class="mt-1 text-sm">${esc(item.text)}</p></div>`).join('')}</div>` : '';
  const full = props.fullFeedbackShowcase ? `<div class="space-y-4"><div class="border border-info bg-info/10 p-4 text-info"><p class="text-sm font-semibold">Page-level banner</p><p class="mt-1 text-sm">New indexed sources are available for review.</p></div><div class="flex flex-wrap gap-2"><span class="rounded-full bg-base-200 px-2 py-1 text-xs">Default</span><span class="rounded-full bg-primary px-2 py-1 text-xs text-primary-content">Primary</span><span class="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-content">Secondary</span><span class="rounded-full bg-success px-2 py-1 text-xs text-success-content">Success</span><span class="rounded-full bg-warning px-2 py-1 text-xs text-warning-content">Warning</span><span class="rounded-full bg-error px-2 py-1 text-xs text-error-content">Error</span><span class="rounded-full border border-base-300 px-2 py-1 text-xs">Outline</span></div><div class="grid gap-4 lg:grid-cols-2"><div class="border border-base-300 bg-base-100 p-4"><h4 class="text-sm font-semibold">Loading skeleton</h4><div class="mt-3 space-y-3"><div class="h-3 w-4/5 bg-base-200"></div><div class="h-3 w-3/5 bg-base-200"></div><div class="h-3 w-2/3 bg-base-200"></div></div></div><div class="border border-base-300 bg-base-100 p-4 text-center"><div class="mx-auto flex h-12 w-12 items-center justify-center border border-base-300 bg-base-200">∅</div><h4 class="mt-3 text-sm font-semibold">Empty state</h4><p class="mt-1 text-sm text-base-content/60">No sources match the current filter.</p><button type="button" class="mt-3 border border-primary bg-primary px-3 py-2 text-sm text-primary-content">Import source</button></div><div class="border border-error bg-error/10 p-4 text-error"><p class="text-sm font-semibold">404 placeholder</p><p class="mt-1 text-sm">The requested source path no longer exists.</p></div><div class="border border-base-300 bg-base-100 p-4"><div class="ml-auto max-w-sm border border-neutral bg-neutral p-4 text-neutral-content"><p class="text-sm font-semibold">Toast appearance</p><p class="mt-1 text-sm">Decision saved and linked to graph path.</p></div></div></div><label class="block border border-base-300 bg-base-100 p-4"><span class="text-xs font-medium">Inline form feedback</span><input name="feedback-inline" class="mt-1.5 h-10 w-full border border-error bg-base-100 px-3 text-sm" value=""><span class="mt-1.5 block text-xs text-error">A source owner is required before publishing.</span></label></div>` : '';
  return `<div class="space-y-4">${alerts}${full}</div>`;
}

function renderScreen(screen) {
  if (screen.kind === 'dashboard') {
    return `<div class="border border-base-300 bg-base-100 p-4"><div class="mb-4 flex items-center justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-wider text-primary">${esc(screen.eyebrow || 'Dashboard')}</p><h4 class="text-xl font-semibold tracking-tight">${esc(screen.title || 'Workspace overview')}</h4></div><button type="button" class="bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">${esc(screen.actionLabel || 'Run action')}</button></div><div class="grid gap-3 md:grid-cols-4">${(screen.metrics || []).map((metric) => `<div class="border border-base-300 bg-base-100 p-4"><p class="text-xs font-medium text-base-content/60">${esc(metric.label)}</p><p class="mt-2 text-2xl font-semibold tracking-tight ${attrs(metric.class || 'text-base-content')}">${esc(metric.value)}</p><p class="mt-1 text-xs text-base-content/60">${esc(metric.hint || '')}</p></div>`).join('')}</div><div class="mt-4 grid gap-4 lg:grid-cols-2"><div class="border border-base-300 bg-base-100 p-4"><h5 class="text-sm font-semibold">${esc(screen.queueTitle || 'Status groups')}</h5><div class="mt-3 space-y-2">${(screen.queues || []).map((queue) => `<div class="flex items-center justify-between bg-base-200/70 px-3 py-2"><span class="text-sm font-medium">${esc(queue.name)}</span><span class="rounded-full ${attrs(queue.class)} px-2 py-1 text-xs font-medium">${esc(queue.value)}</span></div>`).join('')}</div></div><div class="border border-base-300 bg-base-100 p-4"><h5 class="text-sm font-semibold">${esc(screen.activityTitle || 'Recent activity')}</h5><div class="mt-3 space-y-3">${(screen.activity || []).map((item) => `<div class="flex gap-3"><span class="mt-1 h-2 w-2 rounded-full ${attrs(item.dot)}"></span><div><p class="text-sm font-medium">${esc(item.title)}</p><p class="text-xs text-base-content/60">${esc(item.text)}</p></div></div>`).join('')}</div></div></div></div>`;
  }
  if (screen.kind === 'rule-builder') {
    const trigger = screen.trigger || 'Source contains topic';
    const condition = screen.condition || 'agent-memory';
    const action = screen.action || 'Link to related decision';
    return `<div class="border border-base-300 bg-base-100 p-4"><div class="mb-4"><p class="text-xs font-semibold uppercase tracking-wider text-primary">${esc(screen.eyebrow || 'Rule builder')}</p><h4 class="text-xl font-semibold tracking-tight">${esc(screen.title || 'Route source context')}</h4><p class="mt-1 text-sm text-base-content/65">${esc(screen.description || '')}</p></div><div class="grid gap-4 lg:grid-cols-2"><form class="space-y-4 border border-base-300 bg-base-200/60 p-4"><label class="block"><span class="text-xs font-medium">Trigger</span><select name="trigger" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"><option>${esc(trigger)}</option></select></label><label class="block"><span class="text-xs font-medium">Condition</span><input name="condition" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value="${esc(condition)}"></label><label class="block"><span class="text-xs font-medium">Action</span><input name="action" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value="${esc(action)}"></label><div class="flex gap-2"><button type="button" class="bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary/90">${esc(screen.primaryAction || 'Publish rule')}</button><button type="button" class="border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold hover:bg-base-200">${esc(screen.secondaryAction || 'Preview')}</button></div></form><div class="border border-base-300 bg-base-100 p-4"><h5 class="text-sm font-semibold">Preview</h5><div class="mt-3 border border-warning bg-warning/15 p-4 text-warning-content"><p class="text-sm font-semibold">${esc(screen.previewTitle || 'Review suggested')}</p><p class="mt-1 text-sm">${esc(screen.previewText || 'This rule changes how matching sources are organized.')}</p></div><pre class="mt-4 overflow-auto bg-neutral p-4 font-mono text-xs leading-5 text-neutral-content">${esc(screen.code || `if source.topic == '${condition}'\nthen ${action}`)}</pre></div></div></div>`;
  }
  if (screen.kind === 'settings') {
    const fields = screen.fields || [
      { label: 'Workspace name', value: 'Project workspace' },
      { label: 'Default owner', value: 'Product team' }
    ];
    const fieldMarkup = fields.map((field, index) => {
      const id = slug(field.id || field.label, `setting-${index + 1}`);
      return `<label for="${esc(id)}" class="block"><span class="text-xs font-medium">${esc(field.label)}</span><input id="${esc(id)}" name="${esc(id)}" class="mt-1.5 h-10 w-full border border-base-300 bg-base-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value="${esc(field.value || '')}"></label>`;
    }).join('');
    return `<div class="border border-base-300 bg-base-100 p-4"><div class="mb-4"><p class="text-xs font-semibold uppercase tracking-wider text-primary">${esc(screen.eyebrow || 'Settings')}</p><h4 class="text-xl font-semibold tracking-tight">${esc(screen.title || 'Workspace settings')}</h4></div><form class="grid gap-4 md:grid-cols-2">${fieldMarkup}<label class="flex items-center justify-between gap-4 border border-base-300 bg-base-100 p-3 md:col-span-2"><span class="min-w-0"><span class="block text-sm font-medium">${esc(screen.toggleLabel || 'Enable AI suggestions')}</span><span class="text-xs text-base-content/60">${esc(screen.toggleHelper || 'Suggestions stay reviewable before they change shared context.')}</span></span><input name="settings-toggle" type="checkbox" class="sr-only" checked><span aria-hidden="true" class="h-6 w-10 shrink-0 rounded-full bg-primary p-1"><span class="block h-4 w-4 translate-x-5 rounded-full bg-primary-content"></span></span></label><div class="md:col-span-2 flex gap-2"><button type="button" class="bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary/90">${esc(screen.saveLabel || 'Save settings')}</button><button type="button" class="border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold hover:bg-base-200">${esc(screen.cancelLabel || 'Cancel')}</button></div></form></div>`;
  }
  return `<div class="border border-base-300 bg-base-100 p-4"><p class="text-sm text-base-content/60">Unknown screen example.</p></div>`;
}

function renderExample(example) {
  return `<article class="border border-base-300 bg-base-100" data-example-type="${esc(example.type)}"><div class="border-b border-base-300 p-4"><h3 class="text-base font-semibold">${esc(example.title)}</h3><p class="mt-1 text-sm leading-6 text-base-content/65">${esc(example.description)}</p>${tokenChips(example.tokens)}</div><div class="bg-base-200/50 p-4">${renderBody(example)}</div></article>`;
}

const sidebarItems = renderData.sections.map((section) => `<a class="flex border-l border-transparent px-3 py-2 text-sm font-medium text-base-content/70 hover:border-primary hover:bg-base-200 hover:text-base-content" href="#${esc(section.id)}">${esc(section.title)}</a>`).join('\n        ');
const sections = renderData.sections.map((section) => {
  const examples = section.examples.map(renderExample).join('\n    ');
  const gridClass = 'grid gap-6';
  const href = chapterHref(section.sourceChapter);
  return `<section id="${esc(section.id)}" class="scroll-mt-8 border-t border-base-300 py-8" data-source-chapter="${esc(section.sourceChapter)}"><div class="mb-6 flex flex-col gap-3 border-b border-base-300 pb-4 lg:flex-row lg:items-end lg:justify-between"><div><a href="${esc(href)}" class="text-xs font-semibold uppercase tracking-wider text-base-content/55 underline-offset-2 hover:text-accent hover:underline">${esc(section.sourceChapter)}</a><h2 class="mt-1 text-2xl font-semibold tracking-tight">${esc(section.title)}</h2></div><p class="max-w-3xl text-sm leading-6 text-base-content/65 lg:text-right">${esc(section.description)}</p></div><div class="${gridClass}">${examples}</div></section>`;
}).join('\n        ');

const footer = `<footer class="mt-10 border-t border-base-300 py-6 text-sm text-base-content/60"><div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><p>${esc(renderData.guideName)} demo · ${esc(renderData.version)}</p><p>Static Tailwind-first look-and-feel showcase generated from structured demo data.</p></div></footer>`;

const shell = fs.readFileSync(path.join(here, 'index.html'), 'utf8')
  .replaceAll('{{guideName}}', esc(renderData.guideName))
  .replaceAll('{{version}}', esc(renderData.version))
  .replaceAll('{{description}}', esc(renderData.description))
  .replaceAll('{{stylesheet}}', esc(renderData.stylesheet || renderData.tailwindExport || './dist/demo.css'))
  .replaceAll('{{sidebarItems}}', sidebarItems)
  .replaceAll('{{sections}}', sections)
  .replaceAll('{{footer}}', footer);

fs.writeFileSync(path.join(demoRoot, 'index.html'), shell);
console.log(`Wrote ${path.join(demoRoot, 'index.html')}`);
