import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  changeEmail,
  changePassword,
  deleteAccount,
  updateProfile,
} from '../api/profile-api';
import { currentProfileQueryKey, profileStatisticsQueryKey } from './profile-query-keys';
import { clearUserQueryCache } from '../utils/clear-user-query-cache';
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UpdateProfileRequest,
} from '../types';

function invalidateProfileQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: currentProfileQueryKey() });
  void queryClient.invalidateQueries({ queryKey: profileStatisticsQueryKey() });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(currentProfileQueryKey(), profile);
      invalidateProfileQueries(queryClient);
      await refreshUser();
    },
  });
}

export function useChangeEmailMutation() {
  const queryClient = useQueryClient();
  const { updateSession } = useAuth();

  return useMutation({
    mutationFn: (payload: ChangeEmailRequest) => changeEmail(payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(currentProfileQueryKey(), response.user);
      await updateSession(response.accessToken, response.user);
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();
  const { updateSession } = useAuth();

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(currentProfileQueryKey(), response.user);
      await updateSession(response.accessToken, response.user);
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: (payload: DeleteAccountRequest) => deleteAccount(payload),
    onSuccess: async () => {
      clearUserQueryCache(queryClient);
      await logout();
    },
  });
}
