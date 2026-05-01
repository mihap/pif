# 12. Feedback & Alerts

[Opening paragraph — describe how alerts, toasts, and badges keep feedback timely, local, and easy to act on without interrupting the interface hierarchy.]

---

## Alert Variants

Info, Success, Warning, and Error draw from the Semantic Colors in §02. Neutral draws from the Neutral palette in §02 and is a non-status variant for ambient announcements.

| Variant | Background    | Border          | Icon           | Usage                            |
|---------|---------------|-----------------|----------------|----------------------------------|
| Info    | [token]       | [token / width] | [icon name]    | [Usage]                          |
| Success | [token]       | [token / width] | [icon name]    | [Usage]                          |
| Warning | [token]       | [token / width] | [icon name]    | [Usage]                          |
| Error   | [token]       | [token / width] | [icon name]    | [Usage]                          |
| Neutral | [token]       | [token / width] | [icon name]    | [Usage]                          |

---

## Alert Anatomy

| Element            | Specification           | Notes                             |
|--------------------|-------------------------|-----------------------------------|
| Container padding  | [rem (utility)]          | [Notes]                           |
| Icon size          | [rem]                    | [Notes]                           |
| Icon-to-text gap   | [rem (utility)]          | [Notes]                           |
| Title font         | [rem (utility) + weight] | [Notes]                           |
| Body font          | [rem (utility) + weight] | [Notes]                           |
| Border radius      | [rem (utility)]          | [Notes]                           |
| Dismiss button     | [size + placement rule] | [Notes]                           |

---

## Toast Notifications

| Property       | Value                  | Notes                             |
|----------------|------------------------|-----------------------------------|
| Placement      | [placement rule]       | [Notes]                           |
| Max width      | [rem]                   | [Notes]                           |
| Padding        | [padding rule]          | [Notes]                           |
| Shadow         | [utility]              | [Notes]                           |
| Border radius  | [rem (utility)]         | [Notes]                           |
| Auto-dismiss   | [duration rule]        | [Notes]                           |
| Stack gap      | [rem]                   | [Notes]                           |
| Animation      | [enter animation]      | [Notes]                           |

---

## Badge Styles

| Variant   | Background     | Text          | Usage                     |
|-----------|----------------|---------------|---------------------------|
| Default   | [token]        | [token]       | [Usage]                   |
| Primary   | [token]        | [token]       | [Usage]                   |
| Secondary | [token]        | [token]       | [Usage]                   |
| Success   | [token]        | [token]       | [Usage]                   |
| Warning   | [token]        | [token]       | [Usage]                   |
| Error     | [token]        | [token]       | [Usage]                   |
| Outline   | [token]        | [token]       | [Usage]                   |
