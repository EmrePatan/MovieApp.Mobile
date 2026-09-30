import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  createPassword,
  linkExternalLogin,
  resendPendingEmailChange,
  unlinkExternalLogin,
} from '../api/credential-api';
import {
  changeEmail,
  changePassword,
  deleteAccount,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from '../api/profile-api';
import { currentProfileQueryKey, profileStatisticsQueryKey } from './profile-query-keys';
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  CreatePasswordRequest,
  DeleteAccountRequest,
  LinkExternalLoginRequest,
  UnlinkExternalLoginRequest,
  UpdateProfileRequest,
} from '../types';

function invalidateProfileQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: currentProfileQueryKey() });
  void queryClient.invalidateQueries({ queryKey: profileStatisticsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: ['reviews'] });
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

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) => uploadAvatar(file),
    onSuccess: async (profile) => {
      queryClient.setQueryData(currentProfileQueryKey(), profile);
      invalidateProfileQueries(queryClient);
      await refreshUser();
    },
  });
}

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: () => removeAvatar(),
    onSuccess: async (profile) => {
      queryClient.setQueryData(currentProfileQueryKey(), profile);
      invalidateProfileQueries(queryClient);
      await refreshUser();
    },
  });
}

export function useChangeEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeEmailRequest) => changeEmail(payload),
    onSuccess: async () => {
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useResendPendingEmailChangeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resendPendingEmailChange(),
    onSuccess: async () => {
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useLinkExternalLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LinkExternalLoginRequest) => linkExternalLogin(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(currentProfileQueryKey(), profile);
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useUnlinkExternalLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      provider,
      ...payload
    }: UnlinkExternalLoginRequest & { provider: string }) =>
      unlinkExternalLogin(provider, payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(currentProfileQueryKey(), profile);
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useCreatePasswordMutation() {
  const queryClient = useQueryClient();
  const { updateSession } = useAuth();

  return useMutation({
    mutationFn: (payload: CreatePasswordRequest) => createPassword(payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(currentProfileQueryKey(), response.user);
      await updateSession(response.accessToken, response.refreshToken, response.user);
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
      await updateSession(response.accessToken, response.refreshToken, response.user);
      invalidateProfileQueries(queryClient);
    },
  });
}

export function useDeleteAccountMutation() {
  const { completeAccountDeletion } = useAuth();

  return useMutation({
    mutationFn: (payload: DeleteAccountRequest) => deleteAccount(payload),
    onSuccess: async () => {
      await completeAccountDeletion();
    },
  });
}
