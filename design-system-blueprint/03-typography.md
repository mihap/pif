# 3. Typography

[Opening paragraph — name the primary typeface and rationale (screen legibility, tabular figures, overall tone alignment).]

---

## Font Stack

```
/* Sans-serif */
font-family: "[Primary typeface]", [UI sans fallback], [system fallback], [generic fallback];

/* Monospace for code */
font-family: "[Primary monospace]", "[Secondary monospace]", [UI mono fallback], monospace;
```

---

## Font Weights

[Paragraph — how many weights are used and why; stance on bold (700) and heavier.]

| Weight    | Name       | CSS                   | Usage                                   |
|-----------|------------|-----------------------|-----------------------------------------|
| [weight]  | [name]     | [utility class]       | [Usage — where this weight is applied]  |
| [weight]  | [name]     | [utility class]       | [Usage — where this weight is applied]  |
| [weight]  | [name]     | [utility class]       | [Usage — where this weight is applied]  |

---

## Type Scale

[One-line — describe modular progression, ratio, and line-height strategy.]

| Name       | Size   | Weight    | Line Height   | Tailwind          | Usage                          |
|------------|--------|-----------|---------------|-------------------|--------------------------------|
| Display    | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| H1         | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| H2         | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| H3         | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| H4         | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| H5         | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| Body Large | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| Body       | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| Small      | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |
| Tiny       | [rem]   | [weight]  | [unitless]    | [utility class]   | [Usage]                        |

---

## Line Height Guidelines

[One-line — describe how line height affects readability and the chosen stance.]

| Category | Line Height  | Tailwind          | Usage                                 |
|----------|--------------|-------------------|---------------------------------------|
| Tight    | [unitless]   | [utility class]   | [Usage]                               |
| Snug     | [unitless]   | [utility class]   | [Usage]                               |
| Normal   | [unitless]   | [utility class]   | [Usage]                               |
| Relaxed  | [unitless]   | [utility class]   | [Usage]                               |
| Loose    | [unitless]   | [utility class]   | [Usage]                               |

---

## Letter Spacing

| Category | Value   | Tailwind          | Usage                         |
|----------|---------|-------------------|-------------------------------|
| Tighter  | [em]    | [utility class]   | [Usage]                       |
| Tight    | [em]    | [utility class]   | [Usage]                       |
| Normal   | [em]    | [utility class]   | [Usage]                       |
| Wide     | [em]    | [utility class]   | [Usage]                       |
| Wider    | [em]    | [utility class]   | [Usage]                       |

---

## Paragraph Spacing

[One-line — why consistent paragraph spacing matters for rhythm and scanability.]

| Element    | Margin Bottom     | Notes                             |
|------------|-------------------|-----------------------------------|
| H1         | [rem (utility)]    | [Notes]                           |
| H2         | [rem (utility)]    | [Notes]                           |
| H3         | [rem (utility)]    | [Notes]                           |
| H4 – H5    | [rem (utility)]    | [Notes]                           |
| Paragraph  | [rem (utility)]    | [Notes]                           |
| List       | [rem (utility)]    | [Notes]                           |
| List item  | [rem (utility)]    | [Notes]                           |
