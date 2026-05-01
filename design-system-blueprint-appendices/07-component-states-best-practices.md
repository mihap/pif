# Appendix to §07 Component States

## Scope

Use this appendix to define how components communicate interaction, availability, and status. It covers shared state semantics and visibility rules across buttons, inputs, and selection controls. It does not replace the per-component behavior decisions in later appendices.

## Best Practices by Blueprint Section

### State Overview

- Rule: Define default, hover, focus, disabled, selected, and error states explicitly instead of leaving meaning to guesswork.
- Use it when: a component changes appearance in response to interaction or system status.
- Check: a reviewer can list every supported state for the component without inferring any from memory.

### Primary Button States

- Rule: Make high-emphasis button states feel like a clear action progression, not unrelated visual jumps.
- Use it when: you define hover, focus, pressed, loading, or disabled behavior for the primary action style.
- Check: the primary action stays dominant while each state still reads as part of one family.

### Secondary / Outline Button States

- Rule: Keep lower-emphasis button states readable without letting them compete with the primary action.
- Use it when: you style secondary, outline, quiet, or supporting actions.
- Check: secondary states stay obvious enough to use but never become the loudest action in the group.

### Input Field States

- Rule: Use consistent border and feedback changes so field state remains legible.
- Use it when: a field becomes focused, filled, invalid, successful, read-only, or disabled.
- Check: the user can tell what changed without reading nearby copy first.

### Focus Ring Specifications

- Rule: Use a focus ring of at least 2px with a visible offset and a contrast ratio of at least 3:1 against adjacent fill, border, and background colors (WCAG 2.4.11), even when the rest of the component styling stays restrained.
- Use it when: the component can receive focus through keyboard, assistive tech, or remote input.
- Check: focus remains visible on light, dark, filled, and outlined variants.

### Checkbox & Radio States

- Rule: Make checked, unchecked, and disabled control states distinguishable without relying on user memory.
- Use it when: a control switches between binary or single-choice options.
- Check: selected state is obvious even before the label is read.

### Toggle / Switch States

- Rule: Reserve toggles for immediate on/off settings and avoid using them as a hierarchy system.
- Use it when: a user can change a setting instantly without needing an extra confirmation step.
- Check: the toggle still makes sense if the user sees only the label and the on/off state.

## DO

- Do treat state coverage as part of the component contract, not as optional polish.
- Do keep selection-state differences unambiguous in both active and disabled controls.

## DON'T

- Don't let secondary actions or alternate button states compete with the primary call to action.
- Don't use toggles where the user needs a richer choice model or hierarchical control.

## Local Decisions Required

- Decide which components support success or warning states in addition to the required interaction states.
- Define which focus treatment is mandatory across the system and where stronger accessibility overrides are allowed.
