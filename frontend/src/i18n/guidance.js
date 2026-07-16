export const GUIDANCE_KEYS = [
  'guidance.insight.menstruation.restore',
  'guidance.insight.menstruation.checkIn',
  'guidance.insight.follicular.explore',
  'guidance.insight.follicular.plan',
  'guidance.insight.ovulation.connect',
  'guidance.insight.ovulation.communicate',
  'guidance.insight.luteal.finish',
  'guidance.insight.luteal.protect',
  'guidance.focus.menstruation.reflect',
  'guidance.focus.menstruation.simplify',
  'guidance.focus.follicular.learn',
  'guidance.focus.follicular.begin',
  'guidance.focus.ovulation.present',
  'guidance.focus.ovulation.connect',
  'guidance.focus.luteal.refine',
  'guidance.focus.luteal.complete'
];

export const translateGuidance = (t, key, type) => {
  const translated = key ? t(key, { defaultValue: '' }) : '';
  return translated || t(`guidance.${type}.fallback`);
};
