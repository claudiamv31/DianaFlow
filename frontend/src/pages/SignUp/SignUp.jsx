import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css';

import leftCardImg from '../../assets/login-left-card.png';
import rightCardImg from '../../assets/login-right-card.png';

import Button from '../../components/Button';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validationErrors = {};
    if (!name.trim()) {
      validationErrors.name = 'Please enter your name.';
    }
    if (!lastName.trim()) {
      validationErrors.lastName = 'Please enter your last name.';
    }
    if (!email.trim()) {
      validationErrors.email = 'Please enter your email address.';
    }
    if (!password) {
      validationErrors.password = 'Please enter your password.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch('http://localhost:5039/api/users/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: name,
          LastName: lastName,
          Email: email,
          Password: password
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setFieldErrors({
          form: errorData?.message || 'Error creating account'
        });
        return;
      }
      // After successful sign‑up, redirect to period setup wizard
      navigate('/period-setup');
    } catch (error) {
      console.error('Error in sign‑up:', error.message);
      setFieldErrors({
        form: error.message || 'Error creating account'
      });
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

  const getMissingLabel = (field) => {
    const message = fieldErrors[field];
    return message?.startsWith('Please enter') ? 'Required' : null;
  };

  return (
    <div className="login-screen-bg min-h-screen w-full flex items-center justify-center relative overflow-hidden font-body p-4">
      {/* Decorative Left Card */}
      <div className="hidden lg:block absolute left-[8%] top-[55%] -translate-y-1/2 w-[220px] h-[340px] rounded-[2.5rem] overflow-hidden tilted-card-left">
        <img
          src={leftCardImg}
          className="w-full h-full object-cover"
          alt="Decorative gold wave"
        />
      </div>

      {/* Decorative Right Card */}
      <div className="hidden lg:block absolute right-[8%] top-[45%] -translate-y-1/2 w-[260px] h-[390px] rounded-[3rem] overflow-hidden tilted-card-right">
        <img
          src={rightCardImg}
          className="w-full h-full object-cover"
          alt="Decorative lotus petal"
        />
      </div>

      {/* Sign‑Up Container */}
      <div className="w-full max-w-[460px] z-10 flex flex-col items-center">
        <h1 className="text-4xl font-headline font-bold text-[#6D3B47] mb-1">
          DianaFlow
        </h1>
        <p className="text-sm text-[#716164] mb-8">
          Create your digital sanctuary
        </p>

        <div className="w-full bg-[#FCF8F5]/80 backdrop-blur-md rounded-[3rem] shadow-[0_16px_48px_rgba(109,59,71,0.06)] border border-white/40 p-8 md:p-10 flex flex-col">
          <form
            onSubmit={handleSignUp}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Jane"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError('name');
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? 'signup-name-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 pr-28 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all ${
                    fieldErrors.name
                      ? 'auth-input-error'
                      : 'bg-[#ECE7E3]/60 focus:ring-2 focus:ring-[#B97A89]/30'
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
                  className="px-1 text-xs font-semibold text-[#B33F4A]"
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Last name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearFieldError('lastName');
                  }}
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  aria-describedby={
                    fieldErrors.lastName ? 'signup-last-name-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 pr-28 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all ${
                    fieldErrors.lastName
                      ? 'auth-input-error'
                      : 'bg-[#ECE7E3]/60 focus:ring-2 focus:ring-[#B97A89]/30'
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
                  className="px-1 text-xs font-semibold text-[#B33F4A]"
                >
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="jane@sanctuary.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'signup-email-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 pr-28 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all ${
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
                  id="signup-email-error"
                  className="px-1 text-xs font-semibold text-[#B33F4A]"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'signup-password-error' : undefined
                  }
                  className={`auth-input w-full outline-none focus:outline-none rounded-full py-4 pl-6 pr-28 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all ${
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
                  id="signup-password-error"
                  className="px-1 text-xs font-semibold text-[#B33F4A]"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>
            {fieldErrors.form && (
              <p className="rounded-2xl border border-[#F0B9BE] bg-[#FFF6F5] px-4 py-3 text-center text-xs font-semibold text-[#B33F4A]">
                {fieldErrors.form}
              </p>
            )}
            <Button type="submit" variant="primary">
              Sign Up
            </Button>
          </form>
        </div>

        <div className="text-center mt-8 text-sm text-[#716164]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-[#904958] hover:underline"
          >
            Log In
          </Link>
        </div>

        <div className="flex justify-center gap-6 mt-12 text-xs text-[#716164]/70">
          <a href="#privacy" className="hover:underline">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#terms" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
