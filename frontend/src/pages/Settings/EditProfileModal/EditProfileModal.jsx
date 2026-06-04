import React, { useState, useEffect } from 'react';
import {
  useUpdateProfile,
  useUploadAvatar,
  useChangePassword,
  useGetProfile
} from '../../hooks/useProfileHooks';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { data: profileData, isLoading: profileLoading } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const changePasswordMutation = useChangePassword();

  // Profile Details State
  const [profileDetails, setProfileDetails] = useState({
    name: '',
    lastName: '',
    email: ''
  });

  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // Error Messages
  const [errors, setErrors] = useState({});

  // Initialize form with user data
  useEffect(() => {
    if (profileData) {
      setProfileDetails({
        name: profileData.name || '',
        lastName: profileData.lastName || '',
        email: profileData.email || ''
      });
      if (profileData.avatarUrl) {
        setAvatarPreview(`http://localhost:5039${profileData.avatarUrl}`);
      }
    }
  }, [profileData]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleProfileDetailsChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prev) => ({
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

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileDetails = () => {
    const newErrors = {};

    if (!profileDetails.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!profileDetails.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDetails.email)) {
      newErrors.email = 'El formato del correo no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordChange = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword =
        'La nueva contraseña debe tener al menos 8 caracteres';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword =
        'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfileDetails = async () => {
    if (!validateProfileDetails()) return;

    try {
      await updateProfileMutation.mutateAsync({
        name: profileDetails.name,
        lastName: profileDetails.lastName,
        email: profileDetails.email
      });
      // Success message would be shown via toast notification in real app
      console.log('Profile updated successfully');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Error al actualizar el perfil'
      });
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setErrors({ avatar: 'Por favor selecciona una imagen' });
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
      console.log('Avatar uploaded successfully');
    } catch (error) {
      setErrors({
        avatar: error.response?.data?.message || 'Error al subir el avatar'
      });
    }
  };

  const handleChangePassword = async () => {
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
      setActiveTab('profile'); // Switch back to profile tab
      console.log('Password changed successfully');
    } catch (error) {
      setErrors({
        passwordSubmit:
          error.response?.data?.message || 'Error al cambiar la contraseña'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="bg-surface-container-lowest w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/20 px-6 py-4 flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Editar Perfil
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span
                className="material-symbols-outlined text-on-surface"
                data-icon="close"
              >
                close
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant/20 px-6">
            <button
              onClick={() => {
                setActiveTab('profile');
                setErrors({});
              }}
              className={`flex-1 py-4 px-4 font-label font-semibold text-center transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              Perfil
            </button>
            <button
              onClick={() => {
                setActiveTab('avatar');
                setErrors({});
              }}
              className={`flex-1 py-4 px-4 font-label font-semibold text-center transition-colors ${
                activeTab === 'avatar'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              Avatar
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setErrors({});
              }}
              className={`flex-1 py-4 px-4 font-label font-semibold text-center transition-colors ${
                activeTab === 'password'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              Contraseña
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Profile Details Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {errors.submit && (
                  <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {errors.submit}
                  </div>
                )}

                <div>
                  <label className="block font-label font-semibold text-on-surface mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileDetails.name}
                    onChange={handleProfileDetailsChange}
                    disabled={profileLoading || updateProfileMutation.isPending}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="Tu nombre"
                  />
                  {errors.name && (
                    <p className="text-error text-sm mt-1 font-body">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-label font-semibold text-on-surface mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileDetails.lastName}
                    onChange={handleProfileDetailsChange}
                    disabled={profileLoading || updateProfileMutation.isPending}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="Tu apellido"
                  />
                </div>

                <div>
                  <label className="block font-label font-semibold text-on-surface mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileDetails.email}
                    onChange={handleProfileDetailsChange}
                    disabled={profileLoading || updateProfileMutation.isPending}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="tu@correo.com"
                  />
                  {errors.email && (
                    <p className="text-error text-sm mt-1 font-body">
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSaveProfileDetails}
                  disabled={updateProfileMutation.isPending || profileLoading}
                  className="w-full bg-primary text-on-primary font-label font-semibold py-3 rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="check"
                      >
                        check
                      </span>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Avatar Tab */}
            {activeTab === 'avatar' && (
              <div className="space-y-6">
                {errors.avatar && (
                  <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {errors.avatar}
                  </div>
                )}

                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface-container mb-6 bg-surface-container-high flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant">
                        account_circle
                      </span>
                    )}
                  </div>

                  <label className="w-full">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      onChange={handleAvatarSelect}
                      disabled={uploadAvatarMutation.isPending}
                      className="hidden"
                    />
                    <span className="block w-full px-6 py-3 bg-secondary-container text-on-secondary-container font-label font-semibold rounded-lg text-center cursor-pointer hover:bg-secondary-container/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {selectedFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    </span>
                  </label>

                  {selectedFile && (
                    <p className="text-on-surface-variant text-sm mt-2 font-body">
                      {selectedFile.name}
                    </p>
                  )}

                  <p className="text-on-surface-variant text-xs mt-4 text-center font-body">
                    Formatos: JPG, PNG, WebP • Tamaño máximo: 5MB
                  </p>
                </div>

                <button
                  onClick={handleUploadAvatar}
                  disabled={!selectedFile || uploadAvatarMutation.isPending}
                  className="w-full bg-primary text-on-primary font-label font-semibold py-3 rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadAvatarMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="upload"
                      >
                        upload
                      </span>
                      Subir Avatar
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                {errors.passwordSubmit && (
                  <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                    {errors.passwordSubmit}
                  </div>
                )}

                <div className="bg-warning-container/20 border border-warning-container/50 rounded-lg p-4 text-on-surface-variant text-sm font-body">
                  Por seguridad, ingresa tu contraseña actual antes de
                  establecer una nueva.
                </div>

                <div>
                  <label className="block font-label font-semibold text-on-surface mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  {errors.currentPassword && (
                    <p className="text-error text-sm mt-1 font-body">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-label font-semibold text-on-surface mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="Crea una nueva contraseña segura"
                  />
                  {errors.newPassword && (
                    <p className="text-error text-sm mt-1 font-body">
                      {errors.newPassword}
                    </p>
                  )}
                  <p className="text-on-surface-variant text-xs mt-2 font-body">
                    Mínimo 8 caracteres
                  </p>
                </div>

                <div>
                  <label className="block font-label font-semibold text-on-surface mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant text-on-surface font-body placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  {errors.confirmPassword && (
                    <p className="text-error text-sm mt-1 font-body">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-primary text-on-primary font-label font-semibold py-3 rounded-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="lock"
                      >
                        lock
                      </span>
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer spacing */}
          <div className="h-6" />
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
