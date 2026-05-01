# 10. Navigation

[Opening paragraph — describe how navigation establishes orientation, hierarchy, and movement across the product.]

---

## Navigation Patterns

| Pattern         | Usage                               | Desktop Layout           | Mobile Layout            | Notes                          |
|-----------------|-------------------------------------|--------------------------|--------------------------|--------------------------------|
| Global header   | [Usage]                             | [layout rule]            | [layout rule]            | [Notes]                        |
| Sidebar / rail  | [Usage]                             | [layout rule]            | [collapse / drawer rule] | [Notes]                        |
| Local tabs      | [Usage]                             | [layout rule]            | [overflow rule]          | [Notes]                        |
| Breadcrumbs     | [Usage]                             | [layout rule]            | [truncate / wrap rule]   | [Notes]                        |
| Pagination      | [Usage]                             | [layout rule]            | [compact rule]           | [Notes]                        |

---

## Navigation Item Anatomy

| Element              | Specification         | Notes                              |
|----------------------|-----------------------|------------------------------------|
| Item height          | [rem (utility)]       | [Notes]                            |
| Padding X            | [rem (utility)]       | [Notes]                            |
| Padding Y            | [rem (utility)]       | [Notes]                            |
| Icon size            | [rem]                 | [Notes]                            |
| Icon / label gap     | [rem (utility)]       | [Notes]                            |
| Active indicator     | [indicator rule]      | [Notes]                            |
| Badge placement      | [placement rule]      | [Notes]                            |
| Chevron / caret gap  | [rem (utility)]       | [Notes]                            |

---

## Navigation States

| State              | Background    | Text / Icon     | Indicator            | Notes                        |
|--------------------|---------------|-----------------|----------------------|------------------------------|
| Default            | [token]       | [token]         | [token / width]      | [Notes]                      |
| Hover              | [token]       | [token]         | [token / width]      | [Notes]                      |
| Focus              | [token]       | [token]         | [token / width]      | [focus ring spec]            |
| Active / Pressed   | [token]       | [token]         | [token / width]      | [Notes]                      |
| Current / Selected | [token]       | [token]         | [token / width]      | [Notes]                      |
| Disabled           | [token]       | [token / op]    | [token / op]         | [cursor rule]                |

---

## Responsive Navigation Behavior

| Context                | Fallback Rule           | Notes                              |
|------------------------|-------------------------|------------------------------------|
| Desktop header         | [layout rule]           | [Notes]                            |
| Collapsed sidebar      | [collapse rule]         | [Notes]                            |
| Mobile drawer          | [disclosure rule]       | [Notes]                            |
| Overflow tabs          | [overflow rule]         | [Notes]                            |
| Breadcrumb truncation  | [truncate rule]         | [Notes]                            |
| Pagination on mobile   | [compact rule]          | [Notes]                            |
