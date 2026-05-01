# 8. Form Elements & Selection Controls

[Opening paragraph — describe how forms and selection controls stay consistent, easy to scan, and easy to recover from.]

---

## Form Layout Guidelines

| Aspect              | Specification         | Notes                                 |
|---------------------|-----------------------|---------------------------------------|
| Label placement     | [placement rule]      | [Notes]                               |
| Label spacing       | [rem (utility)]        | [Notes]                               |
| Field group gap     | [rem (utility)]        | [Notes]                               |
| Inline fields gap   | [rem (utility)]        | [Notes]                               |
| Helper text spacing | [rem (utility)]        | [Notes]                               |
| Error text spacing  | [rem (utility)]        | [Notes]                               |
| Max form width      | [rem]                  | [Notes]                               |
| Button alignment    | [alignment rule]      | [Notes]                               |

---

## Label Styling

| Property            | Value                     | Notes                              |
|---------------------|---------------------------|------------------------------------|
| Font size           | [rem (utility)]            | [Notes]                            |
| Font weight         | [weight (utility)]        | [Notes]                            |
| Color               | [color token]             | [Notes]                            |
| Required indicator  | [indicator + utility]     | [Notes]                            |
| Optional indicator  | [indicator + utility]     | [Notes]                            |

---

## Helper & Error Text

| Type            | Font Size          | Color           | Icon                    |
|-----------------|--------------------|-----------------|-------------------------|
| Helper text     | [rem (utility)]     | [color token]   | [icon rule]             |
| Error text      | [rem (utility)]     | [color token]   | [icon rule]             |
| Success text    | [rem (utility)]     | [color token]   | [icon rule]             |
| Character count | [rem (utility)]     | [color token]   | [alignment rule]        |

---

## Input Variations

| Type          | Control Anatomy                     | Supporting Element / Rule         | Notes                          |
|---------------|--------------------------------------|-----------------------------------|--------------------------------|
| Text input    | [field anatomy]                      | [leading / trailing slot rule]    | [Notes]                        |
| Password      | [field anatomy]                      | [visibility toggle rule]          | [Notes]                        |
| Search        | [field anatomy]                      | [search icon + clear action rule] | [Notes]                        |
| Number        | [field anatomy]                      | [stepper rule]                    | [Notes]                        |
| Textarea      | [field anatomy]                      | [min height + resize rule]        | [Notes]                        |
| Select        | [field anatomy]                      | [chevron / selected-text rule]    | [Notes]                        |
| Multi-select  | [field anatomy]                      | [chip / selection summary rule]   | [Notes]                        |
| Date picker   | [field anatomy]                      | [calendar trigger / format rule]  | [Notes]                        |
| File upload   | [field / drop-zone anatomy]          | [supporting text + state rule]    | [Notes]                        |

---

## Selection Controls

| Control            | Control Anatomy                     | Label Placement       | Hit Area / Sizing          | Notes                          |
|--------------------|-------------------------------------|-----------------------|----------------------------|--------------------------------|
| Checkbox           | [box + label arrangement]           | [placement rule]      | [size / target rule]       | [Notes]                        |
| Radio              | [dot + label arrangement]           | [placement rule]      | [size / target rule]       | [Notes]                        |
| Toggle / Switch    | [track + thumb arrangement]         | [placement rule]      | [size / target rule]       | [Notes]                        |
| Choice chip        | [chip anatomy]                      | [placement rule]      | [padding / height rule]    | [Notes]                        |
| Segmented control  | [segment grouping]                  | [placement rule]      | [height / padding rule]    | [Notes]                        |

---

## Control Group Layout

| Context                | Gap                  | Layout Rule          | Notes                          |
|------------------------|----------------------|----------------------|--------------------------------|
| Checkbox list          | [rem (utility)]      | [alignment rule]     | [Notes]                        |
| Radio group            | [rem (utility)]      | [alignment rule]     | [Notes]                        |
| Inline choice chips    | [rem (utility)]      | [wrap rule]          | [Notes]                        |
| Segmented control row  | [rem (utility)]      | [fit / stretch rule] | [Notes]                        |
| Helper / error pairing | [rem (utility)]      | [placement rule]     | [Notes]                        |
