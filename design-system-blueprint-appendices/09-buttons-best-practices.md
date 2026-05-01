# Appendix to §09 Buttons

## Scope

Use this appendix to make button patterns readable, tappable, and clearly prioritized. It covers hierarchy, size, icon support, and icon-only constraints. It does not define progress messaging or cross-screen workflow feedback.

## Best Practices by Blueprint Section

### Button Variants

- Rule: Make the primary button visibly stronger than the rest instead of giving every action the same weight.
- Use it when: multiple actions appear in the same panel, form, table, or toolbar.
- Check: a reviewer can point to the primary action in one glance.

### Button Sizes

- Rule: Give buttons enough space to read as tappable controls, not compressed labels with borders.
- Use it when: you define compact, default, and large button sizes.
- Check: labels remain readable and the button still looks tappable at every supported size.

### Button with Icons

- Rule: Use icons to reinforce action meaning, not to replace clear action labeling.
- Use it when: the icon helps recognition but the action still benefits from text.
- Check: the button still makes sense if the icon is hidden.

### Icon-Only Button Sizes

- Rule: Reserve icon-only actions for familiar patterns with enough target area and surrounding context to stay obvious.
- Use it when: the action is common, compact, and strongly supported by nearby context.
- Check: users can identify the action without opening a tooltip first.

## DO

- Do make buttons look actionable through clear background, spacing, and hierarchy choices.
- Do pair buttons with labels and icon treatment that make the action obvious at a glance.

## DON'T

- Don't crowd users with multiple competing primary buttons in the same decision area.
- Don't use compact or icon-only buttons where the action would become ambiguous or easy to miss.

## Local Decisions Required

- Decide the official button-size tiers and which contexts allow each one.
- Define which icon-only patterns are approved without labels and which must always include text.
