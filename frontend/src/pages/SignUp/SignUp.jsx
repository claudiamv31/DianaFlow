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
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
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
        const errorText = await res.text();
        throw new Error(errorText || 'Error creating account');
      }
      // After successful sign‑up, redirect to period setup wizard
      navigate('/period-setup');
    } catch (error) {
      console.error('Error in sign‑up:', error.message);
    }
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
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Jane"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#ECE7E3]/60 border-none outline-none focus:ring-2 focus:ring-[#B97A89]/30 rounded-full py-4 px-6 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                LastName
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-[#ECE7E3]/60 border-none outline-none focus:ring-2 focus:ring-[#B97A89]/30 rounded-full py-4 px-6 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Email
              </label>
              <input
                type="email"
                placeholder="jane@sanctuary.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#ECE7E3]/60 border-none outline-none focus:ring-2 focus:ring-[#B97A89]/30 rounded-full py-4 px-6 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#6D3B47] uppercase tracking-wider px-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#ECE7E3]/60 border-none outline-none focus:ring-2 focus:ring-[#B97A89]/30 rounded-full py-4 px-6 text-sm text-[#34322f] placeholder-[#B5B1AD] transition-all"
              />
            </div>
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
