# Demo Visual Review Checklist

Use this checklist after `tmp/pif/demo/index.html` is generated and validators pass. The goal is to catch visual, interaction, and product-realism issues that static validators cannot fully judge.

## Setup

1. Build the Tailwind export workspace.
2. Build the demo workspace.
3. Open `tmp/pif/demo/index.html` in a browser.
4. Review desktop width first, then tablet/mobile widths.

## Required Checks

### Page Structure

- [ ] Sidebar navigation is visible on desktop and every item scrolls to the correct section.
- [ ] Main content has a clear title, version, and purpose statement.
- [ ] Sections appear in guide order and are easy to scan.
- [ ] Each example clearly names what decision it demonstrates.

### Token Visibility

- [ ] Color examples show brand, base, semantic, text, link, and feedback usage.
- [ ] Typography examples show primary font, secondary/mono font, main app font size, type scale, text color hierarchy, and links.
- [ ] Spacing examples make density and rhythm visible.
- [ ] Radius and elevation examples show actual surface differences.
- [ ] Button examples show variants, sizes, icon scale, and interactive states.

### Product Realism

- [ ] At least one full product screen combines multiple token families.
- [ ] Product-screen examples look plausible for the stated product domain.
- [ ] Tables contain realistic rows and status values.
- [ ] Forms include realistic labels, helper behavior, actions, and toggles.
- [ ] Feedback examples are scoped to fields, rows, panels, or global context as appropriate.

### Interaction States

- [ ] Buttons show default, hover, focus, active, disabled, and loading treatments.
- [ ] Links show default, hover, focus, and disabled treatments.
- [ ] Navigation shows default, hover, and selected/current treatments.
- [ ] Focus rings are visible and not clipped.
- [ ] Disabled states look unavailable without becoming unreadable.

### Accessibility and Readability

- [ ] Text contrast appears readable in all examples.
- [ ] Semantic statuses are not conveyed by color alone when meaning is critical.
- [ ] Forms have visible labels.
- [ ] Icon-only or compact actions have accessible labels in the source.
- [ ] Body-sized text remains readable at default browser zoom.

### Responsive Behavior

- [ ] Sidebar/header behavior works at desktop, tablet, and mobile widths.
- [ ] Tables do not break the layout on narrow screens.
- [ ] Cards and product screens stack cleanly on mobile.
- [ ] Tap targets remain large enough on mobile.
- [ ] No important content is hidden behind horizontal overflow without an obvious affordance.

### Tailwind and Framework Policy

- [ ] Demo uses its generated demo CSS and declared guide tokens.
- [ ] Demo does not rely on component-framework markup or scripts.
- [ ] Demo does not use arbitrary bracket utilities for core deterministic examples.
- [ ] Demo examples stay static and reproducible from `demo/demo-data.json`.

## Output Format

Record results as:

```md
# Demo Visual Review Results

Status: Pass / Needs fixes

## Blocking Issues

- [file/path] Exact issue and required fix.

## Non-Blocking Improvements

- [file/path] Suggested improvement.

## Screens Reviewed

- Desktop width: pass/fail notes
- Tablet width: pass/fail notes
- Mobile width: pass/fail notes
```
