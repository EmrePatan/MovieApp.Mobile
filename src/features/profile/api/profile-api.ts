import { api } from '@/api/client';
import { buildAvatarUploadFormData } from '@/api/form-data-file';
import { logAvatarUploadAttempt } from '@/api/dev-network-log';
import {
  buildChangeEmailPath,
  buildChangePasswordPath,
  buildCurrentProfilePath,
  buildDeleteAccountPath,
  buildProfileStatisticsPath,
  buildUpdateProfilePath,
  buildUploadAvatarPath,
} from './routes';
import { getProfileStatisticsTimeZone } from '../utils/profile-timezone';
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  MessageResponse,
  UpdateProfileRequest,
  UserProfileAuthResponse,
  UserProfileResponse,
  UserStatisticsResponse,
} from '../types';

export async function getCurrentProfile(signal?: AbortSignal): Promise<UserProfileResponse> {
  return api.get<UserProfileResponse>(buildCurrentProfilePath(), { signal });
}

export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<UserProfileResponse> {
  return api.put<UserProfileResponse>(buildUpdateProfilePath(), payload);
}

export async function uploadAvatar(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<UserProfileResponse> {
  logAvatarUploadAttempt(file);
  const formData = buildAvatarUploadFormData(file);
  return api.postFormData<UserProfileResponse>(buildUploadAvatarPath(), formData);
}

export async function removeAvatar(): Promise<UserProfileResponse> {
  return api.delete<UserProfileResponse>(buildUploadAvatarPath());
}

export async function changeEmail(payload: ChangeEmailRequest): Promise<MessageResponse> {
  return api.put<MessageResponse>(buildChangeEmailPath(), payload);
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<UserProfileAuthResponse> {
  return api.put<UserProfileAuthResponse>(buildChangePasswordPath(), payload);
}

export async function getProfileStatistics(
  signal?: AbortSignal,
): Promise<UserStatisticsResponse> {
  const timeZone = getProfileStatisticsTimeZone();
  return api.get<UserStatisticsResponse>(buildProfileStatisticsPath(timeZone), { signal });
}

export async function deleteAccount(payload: DeleteAccountRequest): Promise<void> {
  await api.delete<void>(buildDeleteAccountPath(), payload);
}
