# Appendix to §10 Navigation

## Scope

Use this appendix to keep navigation readable, low-clutter, and easy to follow under changing screen widths. It covers navigation structure, item anatomy, state clarity, and compact behavior. It does not define every tab, breadcrumb, or pagination pattern for you.

## Best Practices by Blueprint Section

### Navigation Patterns

- Rule: Keep navigation intuitive by removing anything that is not crucial to the journey.
- Use it when: you decide which routes, destinations, or shortcuts belong in a persistent navigation layer.
- Check: users can predict where the next step lives without scanning unrelated items first.

### Navigation Item Anatomy

- Rule: Make navigation items easy to tap and their labels easy to read on real devices.
- Use it when: you define icon, label, badge, and touch-target treatment for nav items.
- Check: the item remains readable and tappable on the smallest supported screen.

### Navigation States

- Rule: Keep current-state treatment readable and low-clutter so it supports orientation instead of becoming the loudest element.
- Use it when: you style current, hover, selected, expanded, or disabled nav items.
- Check: the active location is obvious without overpowering the rest of the navigation.

### Responsive Navigation Behavior

- Rule: When space gets tight, trim in this order — decorative icons, secondary metadata, then overflow chevrons — before shrinking labels or reducing tap targets. Preserve current location, primary destinations, and minimum tap accuracy at every breakpoint.
- Use it when: the same navigation pattern must work across mobile, tablet, and desktop widths.
- Check: compact navigation still tells users where they are and what they can do next.

## DO

- Do keep navigation paths readable, low-clutter, and easy to scan.
- Do simplify navigation under tight space without losing orientation.

## DON'T

- Don't crowd navigation with too many competing items, icons, or status markers.
- Don't let compact navigation hide where the user is or where the next step lives.

## Local Decisions Required

- Decide which navigation patterns are primary in the product and which are fallback patterns for specific surfaces.
- Define the exact collapse, truncation, or overflow rules for compact breakpoints.
