# Simplify Symptom Severity and Remove Notes

DianaFlow will make symptom logging a quick selection experience. Users will choose symptoms through visual cards with icons, localized names, and a clear selected state. Notes will not be collected or displayed anywhere in the symptom experience because they are not needed for the initial product and there is no existing user data to preserve.

Symptom Severity will be available only for catalog items whose `allowsSeverity` flag is true. The initial pain-related symptoms are Headache, Cramps, and Back Pain. Selecting one of these cards reveals three text buttons—Mild, Moderate, and Severe—immediately inside the card, with Mild selected by default. The buttons use subtle color differences in addition to their labels, while remaining understandable without color alone. Non-pain symptoms are recorded without severity (`null`).

The rule belongs to the Symptom Catalog rather than a frontend list of symptom codes, so future catalog additions can declare whether severity is meaningful without changing the form's decision logic. This trades a small amount of catalog/schema configuration for clearer domain ownership, truthful stored data, and a lower-friction logging flow.
