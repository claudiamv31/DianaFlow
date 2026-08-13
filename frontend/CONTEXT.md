# Frontend Context

Frontend domain language for DianaFlow's cycle-tracking interface and localized guidance.

## Language

**Cycle Phase Estimate**:
A date-based estimate of the menstrual, follicular, ovulation, or luteal phase. It does not represent direct measurement of ovulation or hormone levels.
_Avoid_: Cycle phase, measured phase

**Daily Insight**:
Brief, non-diagnostic wellness guidance based on the Cycle Phase Estimate for a selected calendar day. It must not imply guaranteed physical, cognitive, emotional, or fertility outcomes.
_Avoid_: Daily message, phase message

**Daily Focus**:
Action-oriented, non-diagnostic wellness guidance based on the current day's Cycle Phase Estimate. It must defer to the user's observed experience rather than present phase-based generalizations as certainty.
_Avoid_: Focus message, daily message

**Theme Preference**:
The user's selected appearance behavior: System follows the device color scheme, while Light and Dark override it. System is the initial default and resolves to Light when the device preference cannot be detected.
_Avoid_: Theme, mode

**Symptom Logging Form**:
The Home-page interaction for recording one or more predefined symptoms for a calendar day. Each selected symptom is recorded as present; pain-related symptoms may also have their own Symptom Severity before the form is saved.

**Calendar Symptom Details**:
The selected-day Calendar view of that day's Symptom Logs, including pain-related symptom severity and controls to edit or remove the log. Notes are not part of the product experience.

**Today Symptom Logging**:
The Home-page Symptom Logging Form records symptoms for the user's current local calendar date. Historical dates are selected through Calendar Symptom Details.

**Initial Symptom Catalog**:
The first-version predefined symptoms are Headache, Cramps, Bloating, Fatigue, Nausea, Back Pain, Breast Tenderness, Mood Changes, Acne, Food Cravings, Insomnia, and Anxiety.

**Pain-related Symptom**:
A symptom for which the user benefits from reporting intensity: Headache, Cramps, or Back Pain in the initial catalog.

The Symptom Catalog declares whether an item allows severity through `allowsSeverity`; the form does not infer this from the symptom code.

**Symptom Severity**:
The optional intensity detail shown for a Pain-related Symptom. A newly selected Pain-related Symptom starts at Mild; a non-pain Symptom Log has no severity.

**Symptom Card**:
The tappable visual control used to select a Symptom Catalog item in the Symptom Logging Form. It presents the symptom's icon and localized name, and clearly shows whether the item is selected.

Pain-related Symptom Cards reveal their Symptom Severity controls immediately when selected, with Mild selected initially.

Severity uses labeled buttons with subtle color differences; color is supplementary and not the only selection signal.

The Symptom Logging Form and Calendar Symptom Details do not collect or display notes.

**Localized Symptom Name**:
The visible name for a Symptom Catalog item is resolved from its stable code through the active locale. Symptom Logs persist the code relationship, not translated display text.
