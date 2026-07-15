export class AppError extends Error {
  constructor(code) {
    super(code);
    this.name = 'AppError';
    this.code = code;
  }
}

export const API_ERROR_TRANSLATION_KEYS = {
  INVALID_CREDENTIALS: 'auth.error.invalidPassword',
  CURRENT_PASSWORD_INCORRECT: 'password.currentIncorrect',
  INVALID_REQUEST: 'api.error.invalidRequest',
  RESOURCE_NOT_FOUND: 'api.error.resourceNotFound',
  EMAIL_ALREADY_IN_USE: 'auth.error.emailInUse',
  NOT_AUTHORIZED: 'auth.error.login',
  USER_NOT_FOUND: 'setup.noUser',
  NAME_REQUIRED: 'profile.nameRequired',
  EMAIL_REQUIRED: 'profile.emailRequired',
  EMAIL_INVALID: 'profile.emailInvalid',
  PROFILE_UPDATE_FAILED: 'profile.updateError',
  AVATAR_REQUIRED: 'profile.avatarRequired',
  AVATAR_INVALID: 'profile.avatarInvalid',
  AVATAR_UPLOAD_FAILED: 'profile.avatarUploadFailed',
  REFRESH_TOKEN_MISSING: 'auth.error.login',
  SESSION_EXPIRED: 'auth.error.sessionExpired',
  PERIOD_DAYS_REQUIRED: 'api.error.periodDaysRequired',
  PERIOD_START_REQUIRED: 'api.error.periodStartRequired',
  PERIOD_ID_REQUIRED: 'api.error.periodIdRequired',
  DATE_REQUIRED: 'api.error.dateRequired',
  PERIOD_NOT_FOUND: 'api.error.periodNotFound',
  PERIODS_NOT_FOUND: 'api.error.periodsNotFound',
  PERIOD_UPDATE_FAILED: 'api.error.periodUpdateFailed',
  CALENDAR_UPDATE_FAILED: 'calendar.saveError',
  INTERNAL_ERROR: 'error.generic',
  STATS_NOT_FOUND: 'stats.insightWelcome'
};

export const getErrorMessageKey = (error, fallbackKey) => {
  if (error instanceof AppError) return error.code;

  const apiCode = error?.response?.data?.code;
  return API_ERROR_TRANSLATION_KEYS[apiCode] || fallbackKey;
};
