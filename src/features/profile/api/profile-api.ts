import { api } from '@/api/client';
import {
  buildChangeEmailPath,
  buildChangePasswordPath,
  buildCurrentProfilePath,
  buildDeleteAccountPath,
  buildProfileStatisticsPath,
  buildUpdateProfilePath,
} from './routes';
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
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

export async function changeEmail(
  payload: ChangeEmailRequest,
): Promise<UserProfileAuthResponse> {
  return api.put<UserProfileAuthResponse>(buildChangeEmailPath(), payload);
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<UserProfileAuthResponse> {
  return api.put<UserProfileAuthResponse>(buildChangePasswordPath(), payload);
}

export async function getProfileStatistics(
  signal?: AbortSignal,
): Promise<UserStatisticsResponse> {
  return api.get<UserStatisticsResponse>(buildProfileStatisticsPath(), { signal });
}

export async function deleteAccount(payload: DeleteAccountRequest): Promise<void> {
  await api.delete<void>(buildDeleteAccountPath(), payload);
}
