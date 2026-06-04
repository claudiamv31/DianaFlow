import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

// Get current user profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      return await apiClient.getProfile();
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

// Update profile (name, lastName, email)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData) => {
      return await apiClient.updateProfile(updateData);
    },
    onSuccess: (data) => {
      // Invalidate the profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    }
  });
};

// Upload avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return await apiClient.uploadAvatar(formData);
    },
    onSuccess: (data) => {
      // Invalidate the profile query to refetch updated avatar
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Error uploading avatar:', error);
    }
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData) => {
      return await apiClient.changePassword(passwordData);
    },
    onError: (error) => {
      console.error('Error changing password:', error);
    }
  });
};
