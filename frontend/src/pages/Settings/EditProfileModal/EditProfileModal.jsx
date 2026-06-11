import React, { useState, useEffect, useRef } from 'react';
import {
  useUpdateProfile,
  useGetProfile
} from '../../../hooks/useProfileHooks';
import Button from '../../../components/Button';

const DEFAULT_AVATAR =
  'https://api.dicebear.com/7.x/lorelei/svg?backgroundType=linearGradient&backgroundColor=fce8e6,ffd5c6&seed=Diana';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { data: profileData, isLoading: profileLoading } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();

  const fileInputRef = useRef(null);

  const [profileDetails, setProfileDetails] = useState({
    name: '',
    lastName: '',
    email: ''
  });
  // avatarPreview is always a displayable string (data URL or http URL or default)
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  // avatarBase64 is only set when the user picks a NEW image — it's the raw data URL to send to the API
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [errors, setErrors] = useState({});

  // Populate form from fetched profile data
  useEffect(() => {
    if (profileData) {
      setProfileDetails({
        name: profileData.name || '',
        lastName: profileData.lastName || '',
        email: profileData.email || ''
      });
      if (profileData.avatarUrl) {
        setAvatarPreview(
          profileData.avatarUrl.startsWith('data:')
            ? profileData.avatarUrl
            : `http://localhost:5039${profileData.avatarUrl}`
        );
      } else {
        setAvatarPreview(DEFAULT_AVATAR);
      }
    }
  }, [profileData]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setAvatarPreview(dataUrl); // show immediately in preview
      setAvatarBase64(dataUrl); // remember to send on save
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!profileDetails.name.trim()) newErrors.name = 'The name is required';
    if (!profileDetails.email.trim()) newErrors.email = 'The email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDetails.email))
      newErrors.email = 'The email format is invalid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Single API call — avatar Base64 travels alongside name/email
      await updateProfileMutation.mutateAsync({
        name: profileDetails.name,
        lastName: profileDetails.lastName,
        email: profileDetails.email,
        ...(avatarBase64 ? { avatarUrl: avatarBase64 } : {})
      });
      setAvatarBase64(null);
      onClose();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Error updating profile'
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
            Edit Profile
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
          onSubmit={handleSave}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-8 pb-6 overflow-y-auto flex-1">
            <p className="text-on-surface-variant text-sm mb-6 px-2">
              Update your personal information.
            </p>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-[0_8px_24px_rgba(52,50,47,0.08)] bg-surface-container-low cursor-pointer relative group transition-all"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl">
                        account_circle
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="material-symbols-outlined text-white text-xl">
                      photo_camera
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs font-bold text-primary/100 hover:underline"
                >
                  Change profile picture
                </button>
                {avatarBase64 && (
                  <span className="text-[11px] text-on-surface-variant mt-1">
                    ✓ New photo selected
                  </span>
                )}
              </div>

              {errors.submit && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-semibold px-4">
                  {errors.submit}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                  htmlFor="modal-profile-name"
                >
                  Name
                </label>
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-profile-name"
                  type="text"
                  name="name"
                  value={profileDetails.name}
                  onChange={handleFieldChange}
                  disabled={profileLoading || updateProfileMutation.isPending}
                  required
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-error text-xs px-2 font-semibold">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* LastName Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                  htmlFor="modal-profile-lastname"
                >
                  Last Name
                </label>
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-profile-lastname"
                  type="text"
                  name="lastName"
                  value={profileDetails.lastName}
                  onChange={handleFieldChange}
                  disabled={profileLoading || updateProfileMutation.isPending}
                  placeholder="Your last name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold text-primary/100 tracking-widest uppercase px-2"
                  htmlFor="modal-profile-email"
                >
                  Email
                </label>
                <input
                  className="w-full h-14 px-6 bg-surface-container-low border-none rounded-full text-on-surface font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  id="modal-profile-email"
                  type="email"
                  name="email"
                  value={profileDetails.email}
                  onChange={handleFieldChange}
                  disabled={profileLoading || updateProfileMutation.isPending}
                  required
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-error text-xs px-2 font-semibold">
                    {errors.email}
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
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                className="w-full h-14"
                disabled={updateProfileMutation.isPending || profileLoading}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
