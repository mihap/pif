# Appendix to §08 Form Elements & Selection Controls

## Scope

Use this appendix to make form patterns easy to scan, complete, and recover from. It covers field layout, label relationships, validation placement, input variation behavior, and control choice. It does not define every field anatomy detail for every product-specific input.

## Best Practices by Blueprint Section

### Form Layout Guidelines

- Rule: Keep labels, fields, and actions aligned so users can scan a form top-to-bottom without relearning the pattern.
- Use it when: a form contains repeated field rows, stacked sections, or mixed control types.
- Check: a new field can be added without inventing a new alignment rule.

### Label Styling

- Rule: Keep labels visually tied to their fields instead of forcing users to infer ownership.
- Use it when: labels, helper text, prefixes, and control rows share the same area.
- Check: the field still reads clearly if helper text or placeholder text is removed.

### Helper & Error Text

- Rule: Put helper and error guidance next to the affected field instead of batching every message at the top of the form.
- Use it when: a field has formatting rules, validation errors, or success feedback.
- Check: users can recover from an error without scanning the whole form for context.

### Input Variations

- Rule: Keep field-state behavior consistent so different input types still feel like one system.
- Use it when: text fields, selects, textareas, date inputs, and uploads coexist in the same product.
- Check: a focused or invalid state communicates the same kind of change across all field types.

### Selection Controls

- Rule: Choose the control pattern that matches the decision model instead of defaulting to one control everywhere.
- Use it when: the choice is binary, single-select, multi-select, or immediate on/off.
- Check: the control type still makes sense if the label is read without surrounding explanation.

### Control Group Layout

- Rule: Preserve generous hit areas and readable spacing for grouped controls, especially on touch devices.
- Use it when: checkboxes, radios, chips, or segmented controls appear in rows or wrapped groups.
- Check: adjacent options can be tapped accurately without collapsing into one another.

## DO

- Do keep validation and helper copy near the field it explains.
- Do use control types and hit areas that match the user’s choice complexity and device context.

## DON'T

- Don't dump every validation message into one global block and expect users to map errors back manually.
- Don't squeeze controls or grouped options until touch accuracy and scanability break down.

## Local Decisions Required

- Decide which input variations the system officially supports and which ones remain product-specific.
- Define the minimum hit area and spacing rules for touch-first versus pointer-first products if both are in scope.
