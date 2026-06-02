import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, checkUser } from '../../database/authService';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-md mx-auto min-h-screen">
      {/* User Info Section */}
      <section className="flex flex-col items-center mb-12">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-[0_12px_32px_rgba(52,50,47,0.04)]">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8HWNwPd9r7UA9XRDyDhAQ9sdIidNXZJJy-QaVKwG9JwB27KR6JCgXNZspna8sATiKA2KmZGH1VFufgJGpaFhQx0IdVzb9vNW5J9GOotGMzfhbe1_BOwkjml5fn355Gfl4LTupcQJm5K6NQijisQ8L6NBxlldvGs3B3L9gQBB3V2_GZi0_9MINcTCc7Uhr4zXtGRX2bvBvG2ss_gAZSFfZWEYJ9Axj6z3fIqAc1Y_qCLjH9CUxMnQwEJdhifGplGsFbkDzzzmWBAn3"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-primary p-2 rounded-full text-on-primary shadow-[0_12px_32px_rgba(52,50,47,0.04)] active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-sm" data-icon="edit">
              edit
            </span>
          </button>
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-1">
          {user?.name || 'Elena Rostova'}
        </h1>
        <p className="font-body text-on-surface-variant font-medium">
          Cycle Day 14 • Ovulation
        </p>
      </section>

      {/* Settings Grid / Menu Items */}
      <div className="space-y-4">
        {/* Profile Settings Group */}
        <div className="bg-surface-container-low p-2 rounded-2xl">
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-[1rem] hover:bg-surface-container-high transition-colors duration-200 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-secondary-container"
                  data-icon="person_outline"
                >
                  person_outline
                </span>
              </div>
              <span className="font-label font-semibold text-on-surface">
                Edit Profile
              </span>
            </div>
            <span
              className="material-symbols-outlined text-outline-variant"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-[1rem] hover:bg-surface-container-high transition-colors duration-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary"
                  data-icon="lock_reset"
                >
                  lock_reset
                </span>
              </div>
              <span className="font-label font-semibold text-on-surface">
                Change Password
              </span>
            </div>
            <span
              className="material-symbols-outlined text-outline-variant"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>
        </div>

        {/* App Settings Group */}
        <div className="bg-surface-container-low p-2 rounded-2xl">
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-[1rem] hover:bg-surface-container-high transition-colors duration-200 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-tertiary-container"
                  data-icon="notifications_none"
                >
                  notifications_none
                </span>
              </div>
              <span className="font-label font-semibold text-on-surface">
                Notifications
              </span>
            </div>
            <span
              className="material-symbols-outlined text-outline-variant"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-[1rem] hover:bg-surface-container-high transition-colors duration-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim/30 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-secondary"
                  data-icon="shield"
                >
                  shield
                </span>
              </div>
              <span className="font-label font-semibold text-on-surface">
                Privacy & Security
              </span>
            </div>
            <span
              className="material-symbols-outlined text-outline-variant"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-surface-container-highest/50 rounded-2xl hover:bg-error-container/10 transition-colors duration-200 mt-8 group"
        >
          <span className="material-symbols-outlined text-error" data-icon="logout">
            logout
          </span>
          <span className="font-label font-bold text-error uppercase tracking-widest text-[11px]">
            Log Out
          </span>
        </button>
      </div>

      {/* Editorial Quote / Insight Toast */}
      <div className="mt-12 p-6 rounded-2xl bg-tertiary-container/30 border border-tertiary-container/50 text-center italic text-on-tertiary-container font-body text-sm leading-relaxed">
        "Embrace the shifting tides of your body with kindness. You are not just
        tracking numbers; you are listening to your own rhythm."
      </div>
    </main>
  );
};

export default Settings;
