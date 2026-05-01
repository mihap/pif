# Generation Scripts

Reusable scripts for creating and validating generated design guides.

## Create a guide workspace

```bash
node scripts/create-guide.mjs "Product Name" --examples
node scripts/create-guide.mjs "Styleguide" --target docs/styleguide
node scripts/create-guide.mjs "Product Name" --examples --version 0.2.0
```

Creates a guide directory, copies blueprint chapters, copies validator templates, creates demo data/schema support, and writes an initial SemVer manifest version (`0.1.0` by default). Generated demo/export artifacts are written later to `tmp/pif/demo` and `tmp/pif/export`, not into the guide. Use `--version <semver>` to set a different initial guide version. Use `--target` to write to an exact directory such as `docs/styleguide`; use `--out` to write under a parent directory with the generated slug. Use `--force` to refresh support files; add `--overwrite-chapters` only when replacing markdown chapters is intended.

## Merge appendices

```bash
node scripts/merge-appendices.mjs examples/product-name-design-guide
```

Merges appendix guidance into matching chapters. If local decisions are unresolved, the script stops before production-ready output is declared. Use `--allow-unresolved` only when you intentionally want blocking questions inserted.

## Build Tailwind export

```bash
node scripts/build-tailwind-export.mjs examples/product-name-design-guide --build
```

Extracts tokens from the completed guide into a disposable `tmp/pif/export` workspace containing `src/theme.css`, `src/tokens.json`, fixture files, package metadata, and `dist/design-guide.css`. The directory is emptied before each run. Copy or integrate files from that workspace into the target product only when ready. The export targets latest stable Tailwind only.

## Build demo

```bash
node scripts/build-demo.mjs examples/product-name-design-guide --build
```

Renders the demo into a disposable `tmp/pif/demo` workspace from the guide's `demo/demo-data.json`, with its own Tailwind package files and `dist/demo.css`. The renderer backfills standard look-and-feel examples (applied foundations, text, lists, forms, states, tables, feedback, media, overlays, and full-page screens) into the disposable demo data so sparse guide demos still show page-element coverage. The directory is emptied before each run.

## Prepare separate review

```bash
node scripts/prepare-review.mjs examples/product-name-design-guide
```

Writes `review/review-packet.md` for an independent reviewer or review subagent. Use `templates/review/demo-visual-review.md` for the browser-based visual QA pass after validators pass.

## Quality gate

```bash
node scripts/build-tailwind-export.mjs examples/product-name-design-guide --build
node scripts/build-demo.mjs examples/product-name-design-guide --build
node templates/validators/validate-all.mjs examples/product-name-design-guide
```

## Smoke test

```bash
node scripts/smoke-test.mjs
node scripts/smoke-test.mjs --full
```

The default smoke test avoids package installation and checks scaffolding plus guide/demo validation. The full smoke test also installs/builds the MailPilot Tailwind export and runs the full quality gate.
