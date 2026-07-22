import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider } from '../../../i18n/LocaleContext';
import EditProfileModal from './EditProfileModal';

const mockUpdateProfile = jest.fn();
const mockUploadAvatar = jest.fn();
const mockOptimizeAvatar = jest.fn();
const mockProfileData = {
  name: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  avatarUrl: null
};

jest.mock('../../../hooks/useProfileHooks', () => ({
  useGetProfile: () => ({
    data: mockProfileData,
    isLoading: false
  }),
  useUpdateProfile: () => ({
    isPending: false,
    mutateAsync: mockUpdateProfile
  }),
  useUploadAvatar: () => ({
    isPending: false,
    mutateAsync: mockUploadAvatar
  })
}));

jest.mock('../../../utils/avatarImage', () => ({
  optimizeAvatarImage: (file) => mockOptimizeAvatar(file)
}));

describe('EditProfileModal avatar persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('uploads an optimized file instead of embedding Base64 in the profile', async () => {
    const selectedFile = new File(['large image'], 'portrait.png', {
      type: 'image/png'
    });
    const optimizedFile = new File(['small image'], 'portrait.jpg', {
      type: 'image/jpeg'
    });
    mockOptimizeAvatar.mockResolvedValue(optimizedFile);
    mockUploadAvatar.mockResolvedValue({ avatarUrl: '/uploads/avatars/a.jpg' });
    mockUpdateProfile.mockResolvedValue({});

    render(
      <LocaleProvider>
        <EditProfileModal isOpen onClose={jest.fn()} />
      </LocaleProvider>
    );

    fireEvent.change(screen.getByLabelText('Change profile picture'), {
      target: { files: [selectedFile] }
    });

    await screen.findByText('✓ New photo selected');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith(optimizedFile);
    });
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com'
      });
    });
  });
});
