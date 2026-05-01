# Appendix to §02 Color System

## Scope

Use this appendix to turn color tokens into a readable hierarchy. It covers emphasis, contrast, semantic meaning, and depth through color. It does not choose brand hues or exact token names for you.

## Best Practices by Blueprint Section

### Primary Colors

- Rule: Reserve the strongest saturation and contrast for one primary action or one dominant point of emphasis in a view.
- Use it when: a screen has a single next step or one element that must win attention immediately.
- Check: if several elements feel equally urgent, the primary color is spread too widely.

### Base Colors

- Rule: Create depth by stepping lightness between page, surface, and hover layers before adding new hue.
- Use it when: you need separation between canvas, cards, drawers, menus, or hover states.
- Check: surfaces still read as layered when you view the interface in grayscale.

### Neutral Colors

- Rule: Use neutral and darker surfaces for overlays, tooltips, and supporting emphasis instead of inventing extra accents.
- Use it when: a surface needs to feel separate without competing with the primary action color.
- Check: the surface feels distinct without introducing a new semantic meaning.

### Semantic Colors

- Rule: Pair every semantic background, border, or badge with a readable content color.
- Use it when: you define success, warning, error, info, or status-specific tokens.
- Check: the status meaning stays readable in text, icon, and mixed-content combinations.

### Color Usage Guidelines

- Rule: Treat contrast checks as part of token definition, not as post-design cleanup.
- Use it when: you finalize text, border, fill, and state combinations.
- Check: every essential pairing meets WCAG 2.1 AA contrast (4.5:1 for body text, 3:1 for UI text and large text) before release; apply stronger thresholds for focus indicators and critical messaging.

## DO

- Do use color to clarify hierarchy before reaching for heavier visual separation.
- Do test semantic and surface pairings in the actual UI, not as isolated swatches.

## DON'T

- Don't add new hues when contrast, lightness, or a neutral surface already solves the hierarchy problem.
- Don't ship semantic colors whose content, borders, or state layers become hard to read in context.

## Local Decisions Required

- Decide how many semantic color families the system really needs.
- Define dark-mode or alternate-theme behavior for semantic and surface tokens if the product supports multiple themes.
