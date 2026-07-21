import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css';
import apiClient from '../../api/apiClient';
import { getClientTimeZone } from '../../utils/timeZone';

import leftCardImg from '../../assets/login-left-card.png';
import rightCardImg from '../../assets/login-right-card.png';

import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';
import LanguageSelector from '../../components/LanguageSelector';
import { getRequiredFieldLabel } from '../../utils/authValidation';
import { getErrorMessageKey } from '../../api/AppError';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validationErrors = {};
    if (!name.trim()) validationErrors.name = 'auth.validation.name';
    if (!lastName.trim())
      validationErrors.lastName = 'auth.validation.lastName';
    if (!email.trim())
      validationErrors.email = 'auth.validation.email';
    if (!password) validationErrors.password = 'auth.validation.password';

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/users/sign-up', {
        Name: name,
        LastName: lastName,
        Email: email,
        Password: password,
        TimeZone: getClientTimeZone()
      });

      await apiClient.login(email, password);

      navigate('/period-setup');
    } catch (error) {
      console.error('Error in sign‑up:', error);

      setFieldErrors({
        form: getErrorMessageKey(error, 'auth.error.signup')
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field) => {
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      delete nextErrors.form;
      return nextErrors;
    });
  };

  const getMissingLabel = (field) =>
    getRequiredFieldLabel(fieldErrors, field, t);

  return (
    <div className="login-screen-bg min-h-screen w-full flex items-center justify-center relative overflow-hidden font-body p-4">
      <div className="absolute right-4 top-4 z-20">
        <LanguageSelector />
      </div>
      {/* Decorative Left Card */}
      <div className="hidden lg:block absolute left-[8%] top-[55%] -translate-y-1/2 w-[220px] h-[340px] rounded-[2.5rem] overflow-hidden tilted-card-left">
        <img
          src={leftCardImg}
          className="w-full h-full object-cover"
          alt={t('auth.decorativeWave')}
        />
      </div>

      {/* Decorative Right Card */}
      <div className="hidden lg:block absolute right-[8%] top-[45%] -translate-y-1/2 w-[260px] h-[390px] rounded-[3rem] overflow-hidden tilted-card-right">
        <img
          src={rightCardImg}
          className="w-full h-full object-cover"
          alt={t('auth.decorativePetal')}
        />
      </div>

      {/* Sign‑Up Container */}
      <div className="w-full max-w-[460px] z-10 flex flex-col items-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-1">
          DianaFlow
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          {t('auth.tagline.signup')}
        </p>

        <div className="auth-card w-full bg-surface-container-lowest/80 backdrop-blur-md rounded-[3rem] border border-outline-variant/20 p-8 md:p-10 flex flex-col">
          <form
            onSubmit={handleSignUp}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
                {t('auth.name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('auth.placeholder.name')}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError('name');
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? 'signup-name-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 ${
                    getMissingLabel('name') ? 'pr-28' : 'pr-6'
                  } text-sm text-on-surface placeholder:text-outline transition-all ${
                    fieldErrors.name
                      ? 'auth-input-error'
                      : 'bg-surface-container-high/60 focus:ring-2 focus:ring-primary/30'
                  }`}
                />
                {getMissingLabel('name') && (
                  <span className="auth-input-message">
                    {getMissingLabel('name')}
                  </span>
                )}
              </div>
              {fieldErrors.name && !getMissingLabel('name') && (
                <p
                  id="signup-name-error"
                  className="px-1 text-xs font-semibold text-error"
                >
                  {t(fieldErrors.name)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
                {t('auth.lastName')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('auth.placeholder.lastName')}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearFieldError('lastName');
                  }}
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  aria-describedby={
                    fieldErrors.lastName ? 'signup-last-name-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 ${
                    getMissingLabel('lastName') ? 'pr-28' : 'pr-6'
                  } text-sm text-on-surface placeholder:text-outline transition-all ${
                    fieldErrors.lastName
                      ? 'auth-input-error'
                      : 'bg-surface-container-high/60 focus:ring-2 focus:ring-primary/30'
                  }`}
                />
                {getMissingLabel('lastName') && (
                  <span className="auth-input-message">
                    {getMissingLabel('lastName')}
                  </span>
                )}
              </div>
              {fieldErrors.lastName && !getMissingLabel('lastName') && (
                <p
                  id="signup-last-name-error"
                  className="px-1 text-xs font-semibold text-error"
                >
                  {t(fieldErrors.lastName)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t('auth.placeholder.email')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'signup-email-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 ${
                    getMissingLabel('email') ? 'pr-28' : 'pr-6'
                  } text-sm text-on-surface placeholder:text-outline transition-all ${
                    fieldErrors.email
                      ? 'auth-input-error'
                      : 'bg-surface-container-high/60 focus:ring-2 focus:ring-primary/30'
                  }`}
                />
                {getMissingLabel('email') && (
                  <span className="auth-input-message">
                    {getMissingLabel('email')}
                  </span>
                )}
              </div>
              {fieldErrors.email && !getMissingLabel('email') && (
                <p
                  id="signup-email-error"
                  className="px-1 text-xs font-semibold text-error"
                >
                  {t(fieldErrors.email)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider px-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder={t('auth.placeholder.password')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'signup-password-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 ${
                    getMissingLabel('password') ? 'pr-28' : 'pr-6'
                  } text-sm text-on-surface placeholder:text-outline transition-all ${
                    fieldErrors.password
                      ? 'auth-input-error'
                      : 'bg-surface-container-high/60 focus:ring-2 focus:ring-primary/30'
                  }`}
                />
                {getMissingLabel('password') && (
                  <span className="auth-input-message">
                    {getMissingLabel('password')}
                  </span>
                )}
              </div>
              {fieldErrors.password && !getMissingLabel('password') && (
                <p
                  id="signup-password-error"
                  className="px-1 text-xs font-semibold text-error"
                >
                  {t(fieldErrors.password)}
                </p>
              )}
            </div>
            {fieldErrors.form && (
              <p className="rounded-2xl border border-error/30 bg-error-container/10 px-4 py-3 text-center text-xs font-semibold text-error">
                {t(fieldErrors.form)}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="min-w-[7rem]"
            >
              {loading ? (
                <LoadingSpinner
                  size="sm"
                  layout="inline"
                  tone="current"
                  label={t('auth.creatingAccount')}
                />
              ) : (
                t('auth.signUp')
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-8 text-sm text-on-surface-variant">
          {t('auth.hasAccount')}{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:underline"
          >
            {t('auth.logIn')}
          </Link>
        </div>

        <div className="flex justify-center gap-6 mt-12 text-xs text-on-surface-variant/70">
          <a href="#privacy" className="hover:underline">
            {t('auth.privacy')}
          </a>
          <span>•</span>
          <a href="#terms" className="hover:underline">
            {t('auth.terms')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
