# Appendix to §05 Border Radius

## Scope

Use this appendix to decide how rounded each component family should feel. It covers restraint, consistency, and boundary softness. It does not decide the exact numeric radius scale for you.

## Best Practices by Blueprint Section

### Border Radius Scale

- Rule: Use one shared radius scale across the system, allow only adjacent-step changes between related components on the same surface, and reserve full-round (pill, avatar) for explicitly approved exceptions.
- Use it when: you define the shared corner scale for fields, buttons, cards, popovers, and larger surfaces.
- Check: rounded corners reinforce the system style without calling more attention than spacing or color.

### Component-Specific Radii

- Rule: Match radius to component role and size so controls and surfaces feel like part of the same system.
- Use it when: you translate the shared scale into small controls, medium cards, and larger containers.
- Check: adjacent components look related even when their sizes differ.

## DO

- Do use radius to soften boundaries and improve scanning without asking corners to carry depth on their own.

## DON'T

- Don't mix many radius personalities inside one system when spacing, hierarchy, and elevation should carry the difference.

## Local Decisions Required

- Decide the actual radius steps for compact, default, and large surfaces.
- Define which components are allowed to break the default radius pattern, if any.
