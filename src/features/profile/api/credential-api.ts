import { api } from '@/api/client';
import {
  buildCreatePasswordPath,
  buildLinkProviderPath,
  buildUnlinkProviderPath,
} from './routes';
import type {
  CreatePasswordRequest,
  LinkExternalLoginRequest,
  UnlinkExternalLoginRequest,
  UserProfileAuthResponse,
  UserProfileResponse,
} from '../types';

export async function linkExternalLogin(
  payload: LinkExternalLoginRequest,
): Promise<UserProfileResponse> {
  return api.post<UserProfileResponse>(buildLinkProviderPath(), payload);
}

export async function unlinkExternalLogin(
  provider: string,
  payload: UnlinkExternalLoginRequest,
): Promise<UserProfileResponse> {
  return api.delete<UserProfileResponse>(buildUnlinkProviderPath(provider), payload);
}

export async function createPassword(
  payload: CreatePasswordRequest,
): Promise<UserProfileAuthResponse> {
  return api.post<UserProfileAuthResponse>(buildCreatePasswordPath(), payload);
}
