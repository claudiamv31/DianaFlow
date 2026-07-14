export const getRequiredFieldLabel = (errors, field, t) =>
  errors[field] === `auth.validation.${field}` ? t('common.required') : null;
