# Design Guide Intake and Authoring Policy

Use this intake before generating a production-ready pif design guide. If required fields are missing, ask follow-up questions before finalizing the guide.

## Required Inputs

| Field | Required Detail | Notes |
| --- | --- | --- |
| Guide name | Product or system name | Used to create `{name}-design-guide/`. |
| Product context | What the product does and who uses it | Include domain, audience, and primary workflows. |
| Visual direction | Desired feel and reference systems | Example: “Notion/Stripe, but more colorful.” |
| Design constraints | Rules the system must obey | Include density, accessibility, motion, brand, and platform constraints. |
| Brand inputs | Existing brand colors, logo posture, tone | If absent, ask whether opinionated draft values are allowed. |
| Typography inputs | Typeface preference or constraints | If absent, ask whether system/UI defaults are acceptable. |
| Color requirements | Color format, theme mode, semantic requirements | Tailwind unit and token rules still apply. |
| Accessibility requirements | Required WCAG level and product-specific constraints | Default target is WCAG 2.1 AA. |
| Density preference | Compact, default, comfortable, or mixed | Critical for data-heavy products. |
| Examples or references | Screenshots, existing apps, brand guide, or written references | Label invented interpretations as draft decisions. |

## Optional Inputs

| Field | Use |
| --- | --- |
| `tailwind.config.*` | Extract spacing, typography, colors, radius, and shadows. |
| Theme CSS | Extract CSS custom properties and theme values. |
| Token JSON | Preserve canonical token names and values. |
| Component inventory | Fill component chapters from real usage. |
| Screenshots | Infer layout density and hierarchy with user confirmation. |
| Brand guide | Preserve brand colors, tone, type, and logo constraints. |
| Existing website or app URL | Use as reference only; confirm extracted decisions. |

## Missing Information Rule

- If a value is required for production output and no source exists, ask the user.
- If the user explicitly permits invention, label the result as an opinionated draft in `manifest.json`.
- Do not silently invent production token values, principles, accessibility thresholds, or component behavior.
- Completed output must contain no bracket placeholders and no unresolved local decisions.

## Source Handling

### No source material supplied

Ask for one of:

1. A `tailwind.config.*`, theme CSS, design-token file, or token table to extract from.
2. A reference design system or design file such as Figma, screenshots, or a brand guide.
3. Explicit permission to draft opinionated defaults and label them as drafts.

Never silently invent token values, font choices, principles, or do/don't rules.

### Source material supplied

1. Map source values to placeholders without changing table shape.
2. Use rem for spacing, font sizes, and radii; convert px to rem at a 16px base unless the value is a Tailwind-style hairline.
3. Keep border, ring, and divider widths in px.
4. Use unitless line heights, em letter spacing, ms durations, and unitless opacity/depth/noise-style values.
5. If the source omits a value the blueprint asks for, leave the placeholder, use plain `—` for intentional not-applicable cells, or ask a follow-up question. Never use `[—]`.
6. Keep source chapters aligned with downstream references: colors in `02`, typography in `03`, spacing in `04`, radius in `05`, elevation in `06`, and component applications in `07–12`.

### Existing system documentation

1. Read `tailwind.config.*`, theme CSS, design-token files, and component implementation entry points first.
2. Extract actual values into chapters `02–06` before filling component sections.
3. Fill chapters `07–12` from real component usage after tokens are recorded.
4. Quote source file paths in the final summary so the user can verify the extraction.

### Non-Tailwind stack

Confirm the intended structural conversion first. If approved, rename the `Tailwind` column header to the appropriate label such as `Class`, `Token`, or `Variable`; do not delete the column or reshape rows unless explicitly requested.

## Blueprint Editing Rules

| Rule | Why |
| --- | --- |
| Preserve file numbering and order unless explicitly asked to change them. | Files reference each other by number. |
| Preserve table column order and count. | Downstream tooling and reviewers depend on it. |
| Preserve heading levels and section titles. | Titles are stable anchors. |
| Use `—` for not-applicable cells, never blanks and never `[—]`. | Blanks are ambiguous and bracketed values look unfinished. |
| Replace placeholders in place; never wrap them. | `[rem]` becomes `0.25rem`, not `[0.25rem]`. |
| Token names must match across files. | Component chapters must use declared source tokens. |
| Keep prose to one short sentence per cell. | The guide must stay scannable. |
| Use Tailwind unit conventions. | Generated output must align with Tailwind utilities. |
| Do not introduce non-Tailwind framework assumptions unless supplied by source material. | The guide is component-framework-agnostic by default. |
| Do not add or remove blueprint files without explicit instruction. | The chapter structure is the contract. |

## Cross-File Consistency

After any token or rule change, sweep the whole guide:

1. Color tokens declared in `02-color-system.md` are the only color tokens referenced in `07–12`.
2. The type scale in `03-typography.md` supplies referenced size, weight, line height, and letter spacing values.
3. Spacing values referenced in `08–12` come from `04-spacing-system.md` where applicable.
4. Radius values come from `05-border-radius.md`; shadow/elevation values come from `06-shadows-elevation.md`.
5. Button icon sizes are declared in `09-buttons.md` → `Button Sizes` with `xs`, `sm`, `md (default)`, and `lg` rows.
6. Scale-typed values do not appear as raw rem values outside their declaring scale, except where a table defines that scale.
7. Philosophy constraints in `01-design-philosophy.md` are not contradicted later.
8. Shared interaction treatment stays consistent across `07`, `09`, `10`, and `11`.
9. Cover metadata in `00-cover.md` matches the completed guide.

## Completion Quality Gate

Before calling a generated guide complete:

- [ ] No `[` characters remain in generated guide chapters.
- [ ] No completed cell contains `[—]`; intentional not-applicable cells use plain `—`.
- [ ] Every referenced token is declared in its source chapter.
- [ ] Every Tailwind utility referenced is real.
- [ ] Units follow Tailwind conventions.
- [ ] Cover metadata reflects the completed guide.
- [ ] No unsupported framework assumptions were introduced.
- [ ] No table gained or lost a column unless explicitly requested.
- [ ] No unexpected file was added or removed from the approved chapter structure.
- [ ] Validators pass, or exact blockers are reported.

If appendix sidecars changed, also confirm:

- [ ] No appendix file was added under `design-system-blueprint/`.
- [ ] Every appendix includes `Scope`, `Best Practices by Blueprint Section`, `DO`, `DON'T`, and `Local Decisions Required`.
- [ ] Appendix rules are self-contained and operational without external references.

## Tone for Filled Prose

Use a direct, declarative, opinionated, and short voice:

- One sentence per cell.
- Imperative phrasing: “Use X for Y.”
- Concrete rules, not aspirations.
- No marketing language.
- No hedging.

## Common Change Requests

| Request | Response |
| --- | --- |
| Add a new color | Add it to `02`, then reference it in `07`, `09`, `10`, `11`, or `12` where applicable. |
| Add a new button variant | Add it to `09`, then add state treatment to `07` when behavior changes. |
| Add a new navigation pattern | Add it to `10`, aligned with `04` spacing and `07` states. |
| Add a new table variant | Add it to `11`, aligned with `04` spacing and `03` typography. |
| Switch from light to dark mode | Treat it as a new top-level theme and ask before restructuring. |
| Convert to non-Tailwind | Confirm the conversion, then rename `Tailwind` columns globally without reshaping rows unless asked. |
| Add another framework | Ask for explicit source material and label framework-specific assumptions clearly. |
| Generate Figma, Storybook, or tokens.json output | Confirm scope before adding new artifacts. |
| Shorten the guide | Tighten prose without deleting table rows or sections. |
