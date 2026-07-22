import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../database/authService';
import EditProfileModal from './EditProfileModal/EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal/ChangePasswordModal';
import { useGetProfile } from '../../hooks/useProfileHooks';
import { API_URL } from '../../config';
import defaultProfilePic from '../../assets/default-profile-pic-optimized.jpg';
import { useLocale } from '../../i18n/LocaleContext';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeSelector from '../../components/ThemeSelector';

const Settings = () => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { data: profileData } = useGetProfile();
  const { t } = useLocale();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = profileData?.name || t('common.user');
  const displayEmail = profileData?.email || '';

  const rawAvatarUrl = profileData?.avatarUrl;
  const avatarUrl = rawAvatarUrl
    ? rawAvatarUrl.startsWith('data:')
      ? rawAvatarUrl
      : `${API_URL}${rawAvatarUrl}`
    : defaultProfilePic;

  return (
    <main className="pt-24 pb-32 px-6 max-w-md mx-auto min-h-screen">
      {/* User Info Section */}
      <section className="flex flex-col items-center mb-12">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-subtle">
            <img
              alt={t('settings.profileAlt')}
              className="w-full h-full object-cover"
              src={avatarUrl}
            />
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute bottom-0 right-0 bg-primary/100 p-2 rounded-full text-on-primary shadow-subtle active:scale-90 transition-transform"
          >
            <span
              className="material-symbols-outlined text-sm"
              data-icon="edit"
            >
              edit
            </span>
          </button>
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-1">
          {displayName}
        </h1>
        <p className="font-body text-on-surface-variant font-medium text-sm">
          {displayEmail || t('common.noEmail')}
        </p>
      </section>

      {/* Settings Grid / Menu Items */}
      <div className="space-y-4">
        <section className="bg-surface-container-low p-2 rounded-2xl">
          <div className="flex w-full items-center justify-between gap-3 rounded-[1rem] bg-surface-container-lowest p-4">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20"
                data-testid="language-setting-icon-container"
              >
                <span
                  className="material-symbols-outlined text-primary"
                  aria-hidden="true"
                  data-testid="language-setting-icon"
                >
                  language
                </span>
              </div>
              <span className="truncate font-label font-semibold text-on-surface">
                {t('settings.language')}
              </span>
            </div>
            <LanguageSelector variant="settings" />
          </div>
        </section>

        <section className="bg-surface-container-low p-2 rounded-2xl">
          <div className="flex w-full items-center justify-between gap-3 rounded-[1rem] bg-surface-container-lowest p-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20">
                <span
                  className="material-symbols-outlined text-primary"
                  aria-hidden="true"
                >
                  {'brightness_6'}
                </span>
              </div>
              <span className="truncate font-label font-semibold text-on-surface">
                {t('settings.theme')}
              </span>
            </div>
            <ThemeSelector />
          </div>
        </section>

        {/* Profile Settings Group */}
        <div className="bg-surface-container-low p-2 rounded-2xl">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-[1rem] hover:bg-surface-container-high transition-colors duration-200 mb-2"
          >
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
                {t('settings.editProfile')}
              </span>
            </div>
            <span
              className="material-symbols-outlined text-outline-variant"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-[1rem] hover:bg-surface-container-high transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary/100"
                  data-icon="lock_reset"
                >
                  lock_reset
                </span>
              </div>
              <span className="font-label font-semibold text-on-surface">
                {t('settings.changePassword')}
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

        {/* App Settings Group 
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
        </div>*/}

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-surface-container-highest/50 rounded-2xl hover:bg-error-container/10 transition-colors duration-200 mt-8 group"
        >
          <span
            className="material-symbols-outlined text-error"
            data-icon="logout"
          >
            logout
          </span>
          <span className="font-label font-bold text-error uppercase tracking-widest text-[11px]">
            {t('settings.logOut')}
          </span>
        </button>
      </div>

      {/* Editorial Quote / Insight Toast */}
      <div className="mt-12 p-6 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-center italic text-on-surface-variant font-body text-sm leading-relaxed">
        “{t('settings.quote')}”
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </main>
  );
};

export default Settings;
