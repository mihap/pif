# 2. Color System

[Opening paragraph — describe the color system’s roles, the color space used (e.g. HEX / RGB / HSL / OKLCH), and how tokens are delivered for theming and consistency.]

---

## Primary Colors

[One-line description — what primary colors are used for (main actions, key UI elements, brand identification).]

| Color             | Value    | CSS Variable              | Usage                             |
|-------------------|----------|---------------------------|-----------------------------------|
| Primary           | [value]  | [--color-variable]        | [Usage — primary buttons, CTAs]   |
| Primary Content   | [value]  | [--color-variable]        | [Usage — text/icons on primary]   |
| Secondary         | [value]  | [--color-variable]        | [Usage — less prominent actions]  |
| Secondary Content | [value]  | [--color-variable]        | [Usage — text/icons on secondary] |
| Accent            | [value]  | [--color-variable]        | [Usage — links, focus rings]      |
| Accent Content    | [value]  | [--color-variable]        | [Usage — text/icons on accent]    |

---

## Base Colors

[One-line description — what base colors are used for (backgrounds, surfaces, borders, text).]

| Color        | Value   | CSS Variable           | Usage                                         |
|--------------|---------|------------------------|-----------------------------------------------|
| Base 100     | [value] | [--color-variable]     | [Usage — lightest / page background layer]    |
| Base 200     | [value] | [--color-variable]     | [Usage — subtle fills, hover states]          |
| Base 300     | [value] | [--color-variable]     | [Usage — borders, dividers]                   |
| Base Content | [value] | [--color-variable]     | [Usage — primary text, headings, icons]       |

---

## Neutral Colors

[One-line description — what neutral colors are used for (emphasis, contrast elements, dark UI components).]

| Color           | Value   | CSS Variable         | Usage                                       |
|-----------------|---------|----------------------|---------------------------------------------|
| Neutral         | [value] | [--color-variable]   | [Usage — dark badges, tooltips, overlays]   |
| Neutral Content | [value] | [--color-variable]   | [Usage — text/icons on neutral surfaces]    |

---

## Semantic Colors

[One-line description — semantic colors communicate meaning and status; describe whether they are muted or saturated, and why.]

| Color   | Value   | CSS Variable         | Usage                                    | Content Color     |
|---------|---------|----------------------|------------------------------------------|-------------------|
| Info    | [value] | [--color-variable]   | [Usage — informational messages, tips]   | [content color]   |
| Success | [value] | [--color-variable]   | [Usage — confirmations, valid inputs]    | [content color]   |
| Warning | [value] | [--color-variable]   | [Usage — cautions, pending states]       | [content color]   |
| Error   | [value] | [--color-variable]   | [Usage — errors, destructive actions]    | [content color]   |

---

## Semantic Content Colors

[One-line description — content tokens paired with each semantic background to keep text and icons readable on top of Info, Success, Warning, and Error fills.]

| Color           | Value   | CSS Variable         | Usage                                  |
|-----------------|---------|----------------------|----------------------------------------|
| Info Content    | [value] | [--color-variable]   | [Usage — text/icons on info]           |
| Success Content | [value] | [--color-variable]   | [Usage — text/icons on success]        |
| Warning Content | [value] | [--color-variable]   | [Usage — text/icons on warning]        |
| Error Content   | [value] | [--color-variable]   | [Usage — text/icons on error]          |

---

## Color Usage Guidelines

### Text Colors

| Context                                    | Color           | Opacity / Variant     |
|--------------------------------------------|-----------------|-----------------------|
| Primary text (headings, body)              | [color token]   | [opacity or variant]  |
| Secondary text (descriptions, captions)    | [color token]   | [opacity or variant]  |
| Disabled text                              | [color token]   | [opacity or variant]  |
| Placeholder text                           | [color token]   | [opacity or variant]  |
| Links                                      | [color token]   | [opacity or variant]  |
| Link hover                                 | [color token]   | [opacity or variant]  |
| Error text                                 | [color token]   | [opacity or variant]  |
| Success text                               | [color token]   | [opacity or variant]  |

### Background Colors

| Context                   | Color           | Notes                              |
|---------------------------|-----------------|------------------------------------|
| Page background           | [color token]   | [Notes]                            |
| Card / panel background   | [color token]   | [Notes]                            |
| Sidebar / nav background  | [color token]   | [Notes]                            |
| Hover state (rows, items) | [color token]   | [Notes]                            |
| Selected / active state   | [color token]   | [Notes]                            |
| Modal backdrop            | [color token]   | [Notes]                            |
| Tooltip background        | [color token]   | [Notes]                            |

### Border Colors

| Context                         | Color          | Width   |
|---------------------------------|----------------|---------|
| Default borders (cards, inputs) | [color token]  | [px]    |
| Subtle dividers                 | [color token]  | [px]    |
| Strong dividers (sections)      | [color token]  | [px]    |
| Focus rings                     | [color token]  | [px]    |
| Error borders                   | [color token]  | [px]    |
| Success borders                 | [color token]  | [px]    |
