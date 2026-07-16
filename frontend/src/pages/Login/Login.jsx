import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import leftCardImg from '../../assets/login-left-card.png';
import rightCardImg from '../../assets/login-right-card.png';
import './Login.css';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocale } from '../../i18n/LocaleContext';
import LanguageSelector from '../../components/LanguageSelector';
import { getRequiredFieldLabel } from '../../utils/authValidation';
import { getErrorMessageKey } from '../../api/AppError';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validationErrors = {};
    if (!email.trim()) {
      validationErrors.email = 'auth.validation.email';
    }
    if (!password) {
      validationErrors.password = 'auth.validation.password';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await apiClient.login(email, password);
      const user = await apiClient.checkUser();
      if (user) {
        navigate('/');
      } else {
        console.error(
          'It was not possible to verify the user after logging in.'
        );
      }
    } catch (error) {
      console.error('❌ Error logging in:', error);
      const errorData = error.response?.data;
      const field = errorData?.field || 'form';
      const message = getErrorMessageKey(error, 'auth.error.login');

      setFieldErrors({ [field]: message });
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

      {/* Login Container */}
      <div className="w-full max-w-[460px] z-10 flex flex-col items-center">
        {/* Header */}
        <h1 className="text-4xl font-headline font-bold text-[#6D3B47] mb-1">
          DianaFlow
        </h1>
        <p className="text-sm text-[#716164] mb-8">
          {t('auth.tagline.login')}
        </p>

        {/* Form Card */}
        <div className="w-full bg-[#FCF8F5]/80 backdrop-blur-md rounded-[3rem] shadow-[0_16px_48px_rgba(109,59,71,0.06)] border border-white/40 p-8 md:p-10 flex flex-col">
          <form
            onSubmit={handleLogin}
            noValidate
            className="flex flex-col gap-6"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                {t('auth.emailAddress')}
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
                    fieldErrors.email ? 'email-login-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 ${
                    getMissingLabel('email') ? 'pr-28' : 'pr-6'
                  } text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all ${
                    fieldErrors.email
                      ? 'auth-input-error'
                      : 'bg-[#ECE7E3]/60 focus:ring-2 focus:ring-[#B97A89]/30'
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
                  id="email-login-error"
                  className="px-1 text-xs font-semibold text-[#B33F4A] "
                >
                  {t(fieldErrors.email)}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="px-1">
                <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider">
                  {t('auth.password')}
                </label>
              </div>
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
                    fieldErrors.password ? 'password-login-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 ${
                    getMissingLabel('password') ? 'pr-28' : 'pr-6'
                  } text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all ${
                    fieldErrors.password
                      ? 'auth-input-error'
                      : 'bg-[#ECE7E3]/60 focus:ring-2 focus:ring-[#B97A89]/30'
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
                  id="password-login-error"
                  className="px-1 text-xs font-semibold text-[#B33F4A]"
                >
                  {t(fieldErrors.password)}
                </p>
              )}
            </div>

            {fieldErrors.form && (
              <p className="w-fit mx-auto rounded-2xl border border-[#F0B9BE] bg-[#FFF6F5] px-4 py-3 text-center text-xs font-semibold text-[#B33F4A]">
                {t(fieldErrors.form)}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="min-w-[7rem]"
            >
              {loading ? (
                <LoadingSpinner
                  size="sm"
                  layout="inline"
                  tone="current"
                  label={t('auth.signingIn')}
                />
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>

          {/*{/* Divider 
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#E7E2DD]"></div>
            <span className="px-4 text-xs text-[#716164] tracking-wide">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[#E7E2DD]"></div>
          </div>

          {/* Social Sign-In Buttons 
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => alert('Sign in with Google coming soon!')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-[#FDF8F5] border border-[#E7E2DD] rounded-full text-xs font-semibold text-[#34322f] transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99C6.18 7.37 8.87 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.57v2.96h3.89c2.28-2.1 3.54-5.19 3.54-8.69z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.54c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.58.38-2.3L1.39 6.95C.5 8.74 0 10.74 0 12.8c0 2.06.5 4.06 1.39 5.85l3.85-3.11z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.89-2.96c-1.1.74-2.52 1.18-4.07 1.18-3.13 0-5.82-2.33-6.77-5.51L1.39 15.9C3.37 19.8 7.35 23 12 23z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => alert('Sign in with Apple coming soon!')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-[#FDF8F5] border border-[#E7E2DD] rounded-full text-xs font-semibold text-[#34322f] transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.73-1.16 1.87-1.02 2.98 1.11.09 2.23-.55 2.95-1.43z" />
              </svg>
              Apple
            </button>
          </div>*/}
        </div>

        {/* Bottom Signup Text */}
        <div className="text-center mt-8 text-sm text-[#716164]">
          {t('auth.newUser')}{' '}
          <Link
            to="/register"
            className="font-bold text-[#904958] hover:underline"
          >
            {t('auth.createAccount')}
          </Link>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-6 mt-12 text-xs text-[#716164]/70">
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
}

export default Login;
