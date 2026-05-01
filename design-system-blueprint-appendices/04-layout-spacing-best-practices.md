# Appendix to §04 Layout & Spacing

## Scope

Use this appendix to turn spacing tokens into repeatable layout intervals. It covers system spacing, interior padding, and section separation. It does not choose the exact numeric scale or breakpoint values for you.

## Best Practices by Blueprint Section

### Spacing Scale

- Rule: Build spacing from repeatable intervals that extend a readable rhythm across layout, content, and controls.
- Use it when: you define the base spacing ladder for surfaces, gaps, and component padding.
- Check: new layouts can be assembled from existing spacing steps instead of one-off values.

### Applied Spacing Reference

#### Button Padding

- Rule: Give tappable controls enough breathing room that labels and states stay legible.
- Use it when: you set padding for primary, secondary, and compact button sizes.
- Check: buttons still look tappable when the label is short, long, or paired with an icon.

#### Input Field Spacing

- Rule: Keep field, helper, and error spacing consistent so form relationships stay obvious at a glance.
- Use it when: you define vertical rhythm for labels, fields, helper text, and validation text.
- Check: a reader can tell which support text belongs to which field without scanning the whole form.

#### Surface Padding

- Rule: Use interior padding to separate content from its container before adding extra decoration.
- Use it when: you define spacing for cards, modals, drawers, dropdowns, or other bounded surfaces.
- Check: content does not press against the edge even when copy grows or controls stack.

#### Card Spacing

- Rule: Let card padding create readable content groupings instead of crowding blocks together.
- Use it when: a card contains multiple content types such as title, metadata, body copy, and actions.
- Check: the card still scans cleanly if one block is removed or one block becomes longer.

#### Page Layout Spacing

- Rule: Use whitespace to define sections and boundaries instead of ad hoc layout fixes.
- Use it when: you set gaps between major page regions, sections, or stacked modules.
- Check: the page still feels organized after content is reordered or a section is removed.

## DO

- Do make spacing behave like a repeatable layout system rather than a series of local fixes.
- Do use padding to preserve readability and grouping inside controls and surfaces.

## DON'T

- Don't create new spacing values every time a layout feels crowded; adjust the system first.
- Don't let controls and surface content collapse into each other through inconsistent interior spacing.

## Local Decisions Required

- Decide the actual spacing scale, including compact and spacious modes if your product supports both.
- Define when a dense layout is allowed and which surfaces must always keep their default padding.
