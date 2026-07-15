import React, { useState, useEffect } from 'react';
import { useChangePassword } from '../../../hooks/useProfileHooks';
import Button from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useLocale } from '../../../i18n/LocaleContext';
import { getErrorMessageKey } from '../../../api/AppError';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { t } = useLocale();
  const changePasswordMutation = useChangePassword();

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Error Messages
  const [errors, setErrors] = useState({});

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordChange = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'password.currentRequired';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'password.newRequired';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'password.tooShort';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'password.noMatch';
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'password.mustDiffer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      // Clear password fields on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
    } catch (error) {
      setErrors({
        passwordSubmit: getErrorMessageKey(error, 'password.changeError')
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-on-surface/10 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-lg shadow-[0_12px_32px_rgba(52,50,47,0.06)] overflow-hidden flex flex-col relative"
        style={{ maxHeight: '90vh', borderRadius: '3rem' }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-4 flex items-center justify-between">
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            {t('password.title')}
          </h2>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant transition-colors group"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-on-surface-variant group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Content inside form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-8 pb-6 overflow-y-auto flex-1">
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-3xl p-4 text-on-surface-variant text-xs font-medium leading-relaxed mb-6">
              {t('password.description')}
            </div>

            {errors.passwordSubmit && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error/100 text-xs font-semibold mb-6">
                {t(errors.passwordSubmit)}
              </div>
            )}

            <div className="space-y-6">
              {/* Current Password Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                  htmlFor="modal-password-current"
                >
                  {t('password.current')}
                </label>
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-password-current"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  required
                  placeholder={t('auth.placeholder.password')}
                />
                {errors.currentPassword && (
                  <p className="text-error text-xs px-2 font-semibold">
                    {t(errors.currentPassword)}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                  htmlFor="modal-password-new"
                >
                  {t('password.new')}
                </label>
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-password-new"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  required
                  placeholder={t('auth.placeholder.password')}
                />
                {errors.newPassword && (
                  <p className="text-error text-xs px-2 font-semibold">
                    {t(errors.newPassword)}
                  </p>
                )}
                <span className="block text-[10px] text-on-surface-variant px-2">
                  {t('password.minimum')}
                </span>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                  htmlFor="modal-password-confirm"
                >
                  {t('password.confirm')}
                </label>
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-password-confirm"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  required
                  placeholder={t('auth.placeholder.password')}
                />
                {errors.confirmPassword && (
                  <p className="text-error text-xs px-2 font-semibold">
                    {t(errors.confirmPassword)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons (Fixed at bottom) */}
          <div className="px-8 pb-8 pt-4 bg-surface-container-lowest mt-auto border-t border-surface-container-low">
            <div className="grid grid-cols-2 gap-4 px-2">
              <button
                type="button"
                className="h-14 w-full flex items-center justify-center font-headline font-bold text-primary/100 hover:bg-surface-container-high transition-all rounded-full active:scale-95"
                onClick={onClose}
                disabled={changePasswordMutation.isPending}
              >
                {t('common.cancel')}
              </button>
              <Button
                type="submit"
                variant="primary"
                className="w-full h-14"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <LoadingSpinner
                    size="sm"
                    layout="inline"
                    tone="current"
                    label={t('password.saving')}
                  />
                ) : (
                  t('password.change')
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
