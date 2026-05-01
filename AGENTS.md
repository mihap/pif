# AGENTS.md

PI package.

## What this repo is

`pif` is a pi (`@mariozechner/pi-coding-agent`) package. It ships:

- `design-system-blueprint/` — numbered markdown templates `00`–`12` with `[placeholder]` slots. The numbering and table shapes are the contract; later chapters reference earlier ones.
- `design-system-blueprint-appendices/` — best-practice sidecars for chapters `02–12`. Never live inside `design-system-blueprint/`.
- `scripts/` (`.mjs`, ESM, dependency-free) — generation pipeline: `create-guide`, `merge-appendices`, `build-tailwind-export`, `build-demo`, `prepare-review`, `smoke-test`.
- `templates/validators/` — `validate-guide / -tailwind-export / -demo / -all`.
- `examples/mailpilot-design-guide/` — the worked example, kept passing.
- Versioning uses SemVer; new generated guides start at `0.1.0` and validators keep guide/demo/export versions aligned.

## Hard rules

- **Tailwind-first, component-framework-agnostic.** Templates and validators target Tailwind only.
- **Scripts and validators stay dependency-free** (Node ≥ 18, `node:` builtins only).
- **Don't fill `[placeholder]` slots in `design-system-blueprint/`.** Templates ship unfilled; users fill them in their own projects. Editing the templates means changing the structure, wording, or placeholder shape — not replacing slots with concrete values.
- **Don't add or remove files in `design-system-blueprint/`** without explicit instruction. Don't change column counts, column order, row order, file numbering, or heading levels.
- **Don't commit generated demo/export artifacts.** They are regenerated under `tmp/pif/demo` and `tmp/pif/export`; re-run the pipeline instead of hand-editing artifact output.

## Appendix sidecars

Each file in `design-system-blueprint-appendices/` must include `Scope`, `Best Practices by Blueprint Section`, `DO`, `DON'T`, `Local Decisions Required`. Self-contained — strip source maps, evidence ledgers, BP IDs, citation links, source-corpus references. Appendix markdown is excluded from placeholder-bracket validation.

## Verify before declaring done

```bash
node scripts/smoke-test.mjs                                              # fast, no install
node scripts/smoke-test.mjs --full                                       # installs example Tailwind
node scripts/build-tailwind-export.mjs examples/mailpilot-design-guide --build
node scripts/build-demo.mjs examples/mailpilot-design-guide --build
node templates/validators/validate-all.mjs examples/mailpilot-design-guide
npm pack --dry-run                                                       # check package files
```

The MailPilot example must keep passing — regressions there are a blocker.

## Change-together pairs

- Blueprint structure → `README.md` + `AGENTS.md`.
- New validator → wire into `templates/validators/validate-all.mjs` + smoke-test assertion.
- New pipeline script → `scripts/README.md` + README "Development" section.

## Commits

Short imperative subject, no scope prefix, no trailing period (`Add demo visual review checklist`, `Update workflow implementation status`). `tmp/`, `**/node_modules/`, and generated CSS artifacts are gitignored — keep them that way.
