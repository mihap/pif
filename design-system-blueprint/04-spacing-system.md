# 4. Layout & Spacing

[Opening paragraph — describe the base unit and the rule that all spacing values are multiples of it for consistent alignment across components, surfaces, and page layout.]

---

## Spacing Scale

| Token | Value  | Tailwind            | Common Uses                        |
|-------|--------|---------------------|------------------------------------|
| 0     | [rem]   | [utility]           | [Usage]                            |
| 0.5   | [rem]   | [utility]           | [Usage]                            |
| 1     | [rem]   | [utility]           | [Usage]                            |
| 1.5   | [rem]   | [utility]           | [Usage]                            |
| 2     | [rem]   | [utility]           | [Usage]                            |
| 2.5   | [rem]   | [utility]           | [Usage]                            |
| 3     | [rem]   | [utility]           | [Usage]                            |
| 4     | [rem]   | [utility]           | [Usage]                            |
| 5     | [rem]   | [utility]           | [Usage]                            |
| 6     | [rem]   | [utility]           | [Usage]                            |
| 8     | [rem]   | [utility]           | [Usage]                            |
| 10    | [rem]   | [utility]           | [Usage]                            |
| 12    | [rem]   | [utility]           | [Usage]                            |
| 16    | [rem]   | [utility]           | [Usage]                            |
| 20    | [rem]   | [utility]           | [Usage]                            |
| 24    | [rem]   | [utility]           | [Usage]                            |

---

## Applied Spacing Reference

[One-line — map the spacing scale into recurring component, surface, and page-layout decisions.]

### Button Padding

| Size          | Padding Y | Padding X | Height | Font Size |
|---------------|-----------|-----------|--------|-----------|
| xs            | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |
| sm            | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |
| md (default)  | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |
| lg            | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |

### Input Field Spacing

| Size          | Padding Y | Padding X | Height | Font Size |
|---------------|-----------|-----------|--------|-----------|
| sm            | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |
| md (default)  | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |
| lg            | [rem (token)] | [rem (token)] | [rem (token)] | [rem (token)] |

### Surface Padding

| Surface             | Padding          | Gap (internal)    | Usage              |
|---------------------|------------------|-------------------|--------------------|
| Dropdown / popover  | [rem (utility)]  | [rem (utility)]   | [Usage]            |
| Modal content       | [rem (utility)]  | [rem (utility)]   | [Usage]            |
| Drawer / sidebar    | [rem (utility)]  | [rem (utility)]   | [Usage]            |
| Page section block  | [rem (utility)]  | [rem (utility)]   | [Usage]            |

### Card Spacing

| Variant      | Padding          | Gap (internal)   | Usage              |
|--------------|------------------|------------------|--------------------|
| Compact      | [rem (utility)]   | [rem (utility)]   | [Usage]            |
| Default      | [rem (utility)]   | [rem (utility)]   | [Usage]            |
| Comfortable  | [rem (utility)]   | [rem (utility)]   | [Usage]            |
| Spacious     | [rem (utility)]   | [rem (utility)]   | [Usage]            |

### Page Layout Spacing

| Context                         | Value             | Notes                              |
|---------------------------------|-------------------|------------------------------------|
| Page margin (mobile)            | [rem (token)]      | [Notes]                            |
| Page margin (tablet)            | [rem (token)]      | [Notes]                            |
| Page margin (desktop)           | [container rule]   | [Notes]                            |
| Max content width               | [rem (token)]      | [Notes]                            |
| Grid column gap                 | [rem (token)]      | [Notes]                            |
| Grid row gap                    | [rem (token)]      | [Notes]                            |
| Section gap                     | [rem (token)]      | [Notes]                            |
| Component gap (within section)  | [rem (token)]      | [Notes]                            |
| Form field gap                  | [rem (token)]      | [Notes]                            |
| Inline gap (buttons, badges)    | [rem (token)]      | [Notes]                            |
