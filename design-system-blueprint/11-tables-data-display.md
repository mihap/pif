# 11. Tables & Data Display

[Opening paragraph — describe how data-heavy views should balance readability, density, and interaction without losing hierarchy.]

---

## Table Anatomy

| Element              | Specification         | Notes                              |
|----------------------|-----------------------|------------------------------------|
| Header row           | [height + text-style rule] | [Notes]                       |
| Header cell padding  | [rem (utility)]       | [Notes]                            |
| Body cell padding    | [rem (utility)]       | [Notes]                            |
| Row height           | [rem (token)]         | [Notes]                            |
| Column alignment     | [alignment rule]      | [Notes]                            |
| Selection cell       | [width rule]          | [Notes]                            |
| Sort indicator       | [icon + gap rule]     | [Notes]                            |
| Row action cell      | [width / placement rule] | [Notes]                         |
| Footer / pagination  | [layout rule]         | [Notes]                            |

---

## Density & Spacing

Tables cap at Comfortable density to keep scanning fast under data load; reserve `Spacious` (defined for cards in §04) for surfaces that prioritize visual breathing room over scanability.

| Density       | Row Height   | Cell Padding X     | Cell Padding Y     | Usage                          |
|---------------|--------------|--------------------|--------------------|--------------------------------|
| Compact       | [rem (token)] | [rem (utility)]   | [rem (utility)]    | [Usage]                        |
| Default       | [rem (token)] | [rem (utility)]   | [rem (utility)]    | [Usage]                        |
| Comfortable   | [rem (token)] | [rem (utility)]   | [rem (utility)]    | [Usage]                        |

---

## Row & Cell States

| State         | Background    | Border / Divider   | Text               | Notes                          |
|---------------|---------------|--------------------|--------------------|--------------------------------|
| Default       | [token]       | [token / width]    | [token]            | [Notes]                        |
| Hover         | [token]       | [token / width]    | [token]            | [Notes]                        |
| Focus         | [token]       | [focus ring spec]  | [token]            | [Notes]                        |
| Selected      | [token]       | [token / width]    | [token]            | [Notes]                        |
| Expanded      | [token]       | [token / width]    | [token]            | [Notes]                        |
| Error         | [token]       | [token / width]    | [token]            | [Notes]                        |

---

## Data States

| State          | Message / Layout Rule      | Supporting Element      | Action Rule                 | Notes                          |
|----------------|----------------------------|-------------------------|-----------------------------|--------------------------------|
| Empty          | [message / layout rule]    | [icon / illustration]   | [CTA rule]                  | [Notes]                        |
| Loading        | [message / layout rule]    | [skeleton / spinner]    | [blocking / non-blocking]   | [Notes]                        |
| No results     | [message / layout rule]    | [filter summary]        | [reset / refine rule]       | [Notes]                        |
| Error          | [message / layout rule]    | [inline alert / icon]   | [retry rule]                | [Notes]                        |
| Truncated cell | [ellipsis / wrap rule]     | [tooltip / disclosure]  | [expand rule]               | [Notes]                        |

---

## Responsive Data Display

| Context                | Fallback Rule           | Notes                              |
|------------------------|-------------------------|------------------------------------|
| Horizontal overflow    | [overflow rule]         | [Notes]                            |
| Column priority        | [priority rule]         | [Notes]                            |
| Stacked mobile rows    | [stacking rule]         | [Notes]                            |
| Inline filters         | [placement rule]        | [Notes]                            |
| Sticky first column    | [pinning rule]          | [Notes]                            |
| Summary-card fallback  | [fallback rule]         | [Notes]                            |
