# Appendix to §06 Shadows & Elevation

## Scope

Use this appendix to decide how the system shows depth after color, spacing, and borders are already doing their job. It covers shadow restraint, separation methods, and consistent elevation cues. It does not define the final token scale for every surface level.

## Best Practices by Blueprint Section

### Shadow Scale

- Rule: Use shadows with low opacity, limited blur, and limited spread to indicate elevation; never let a shadow become the strongest visual separator on its surface.
- Use it when: a surface must read as floating above the page or above another surface.
- Check: the shadow clarifies stacking order without becoming the strongest visual element.

### Elevation Guidelines

- Rule: Prefer the lightest separation method that still makes hierarchy readable.
- Use it when: a border, background shift, or inset edge could solve the separation before a larger shadow does.
- Check: removing one layer of effect still leaves the hierarchy understandable.

- Rule: Keep light direction and shadow softness consistent so depth reads as one system.
- Use it when: you define hover, popover, dropdown, card, and modal elevation treatments.
- Check: stacked surfaces feel related instead of lit from different worlds.

## DO

- Do use shadows deliberately when color, spacing, or borders cannot communicate depth clearly enough on their own.
- Do keep elevation cues consistent across cards, overlays, and floating surfaces.

## DON'T

- Don't rely on heavy, pure-black shadows as a default layer separator.
- Don't stack borders, large shadows, and strong color shifts on the same surface at once.

## Local Decisions Required

- Decide the actual elevation scale, including how many depth levels the system supports.
- Define which components are allowed to escalate beyond the default depth posture, such as modals or floating menus.
