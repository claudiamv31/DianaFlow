export const FLOW_CODES = ['light', 'medium', 'heavy'];

export const REGULARITY_CODES = [
  'unknown',
  'regular',
  'irregular',
  'very_irregular'
];

export const PHASE_CODES = [
  'menstruation',
  'follicular',
  'ovulation',
  'luteal'
];

export const normalizePhaseCode = (phase) => {
  const normalized = typeof phase === 'string' ? phase.toLowerCase() : '';
  return PHASE_CODES.includes(normalized) ? normalized : null;
};

export const phaseTranslationKey = (phase) => {
  const normalized = normalizePhaseCode(phase);
  return normalized ? `phase.${normalized}` : null;
};

export const calendarPhaseDayTranslationKey = (phase) => {
  const normalized = normalizePhaseCode(phase);
  return normalized
    ? `calendar.phaseDay.${normalized}`
    : 'calendar.phaseDay';
};
