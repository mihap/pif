# Appendix to §12 Feedback & Alerts

## Scope

Use this appendix to make feedback timely, local, and easy to act on. It covers inline alerts, feedback placement, lightweight acknowledgement, and supporting status markers. It does not define every dismissal rule, stacking rule, or badge taxonomy for you.

## Best Practices by Blueprint Section

### Alert Variants

- Rule: Use feedback variants to clarify what happened and what the user should do next.
- Use it when: you communicate success, warning, error, or informational status that needs user interpretation.
- Check: the message names the situation and makes the next step obvious.

### Alert Anatomy

- Rule: Place feedback at the scope of its cause — field errors directly adjacent to the field; form errors at the form boundary with anchor links to each invalid field; row-level feedback inline in the row; toasts reserved for non-blocking, global confirmation.
- Use it when: a validation, save action, destructive step, or inline process needs explanation.
- Check: users do not have to search another part of the screen to connect the message to its cause.

### Toast Notifications

- Rule: Use lightweight action feedback to confirm progress or completion without derailing the main task flow.
- Use it when: the action succeeds or changes state without requiring a decision inside the message itself.
- Check: the task can continue naturally even if the toast disappears.

### Badge Styles

- Rule: Use compact status markers only as supporting signals inside a larger message system.
- Use it when: a badge helps summarize status, count, or category without carrying the full meaning alone.
- Check: the interface still makes sense if the badge is removed and the main label remains.

## DO

- Do place validation and recovery guidance near the thing that triggered it.
- Do acknowledge meaningful actions and progress without forcing users away from the current task.

## DON'T

- Don't flood users with detached or repetitive error messaging that leaves them to map the problem back manually.
- Don't let lightweight feedback carry meaning that belongs in the primary message.

## Local Decisions Required

- Decide which feedback patterns are inline, persistent, dismissible, or temporary in your product.
- Define the badge variants and alert severities the system supports, and when a stronger pattern is required.
