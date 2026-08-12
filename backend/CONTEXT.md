# Backend Context

Backend domain language for DianaFlow's cycle tracking API and persisted health records.

## Language

**Cycle Phase Estimate**:
A date-based estimate of the menstrual, follicular, ovulation, or luteal phase. It does not represent direct measurement of ovulation or hormone levels.
_Avoid_: Cycle phase, measured phase

**Symptom Log**:
A user-owned record of symptoms experienced on a specific calendar day in the cycle. It may exist for any cycle day, but should only capture symptom information the product intends to use.
_Avoid_: Symptom entry, daily symptoms, period symptom

**Symptom Catalog**:
The product-managed set of predefined, reusable symptoms that a user can record, such as headache or cramps. A catalog item is not itself a user's experience, and users do not create catalog items in the first version.

**User Profile**:
The existing user-owned profile information associated with an account. Symptom Logs reference the authenticated User and do not create a second user-information record.

**Symptom Severity**:
The user's self-reported intensity for a Symptom Log: Mild, Moderate, or Severe. It describes the logged experience and is not a clinical assessment. A new log defaults to Mild unless the user selects another value.
