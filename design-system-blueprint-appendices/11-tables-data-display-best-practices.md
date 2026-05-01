# Appendix to §11 Tables & Data Display

## Scope

Use this appendix to keep data views readable, structured, and calm under real product density. It covers table anatomy, density, emphasis, status handling, and compact behavior. It does not define every loading, no-results, or responsive-column pattern for you.

## Best Practices by Blueprint Section

### Table Anatomy

- Rule: Optimize table structure for reading first, then add interaction affordances without obscuring the data.
- Use it when: you define headers, body rows, action cells, selection columns, or summary rows.
- Check: users can scan the key data columns before they notice table chrome.

### Density & Spacing

- Rule: Reduce clutter and keep density readable instead of compressing every row to fit more records.
- Use it when: you create compact, default, or comfortable density modes.
- Check: text, padding, and row height still support quick scanning at the chosen density.

### Row & Cell States

- Rule: Use restrained contrast shifts for row emphasis so the data remains primary.
- Use it when: you style selected, hovered, focused, expanded, or error rows.
- Check: the state is visible, but the row content still carries the visual weight.

### Data States

- Rule: Explain unusual table outcomes in place instead of leaving the data view blank or ambiguous.
- Use it when: the table is empty, filtered to zero, blocked by an error, or waiting for a result.
- Check: users can tell what happened and what to do next without leaving the table context.

### Responsive Data Display

- Rule: When space gets tight, simplify the data presentation without sacrificing legibility.
- Use it when: the same data view must work across multiple widths or device classes.
- Check: the compact version still preserves the most important columns, labels, and actions.

## DO

- Do treat readability, contrast, and font choice as table-system requirements, not nice-to-have polish.
- Do explain status changes clearly when they affect the current table task.

## DON'T

- Don't squeeze table density so far that text size, spacing, and contrast stop serving the data.
- Don't let condensed layouts or state styling compete with the data itself.

## Local Decisions Required

- Decide which density modes the system supports and where each one is allowed.
- Define how responsive tables prioritize, hide, stack, or reframe columns on smaller screens.
