jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('expo-file-system', () => {
  class MockExpoFile extends Blob {
    exists = true;
    type = 'image/jpeg';
    readonly fileUri: string;

    constructor(fileUri: string) {
      super([], { type: 'image/jpeg' });
      this.fileUri = fileUri;
    }

    get name() {
      return 'avatar.jpg';
    }

    rename(): void {}
  }

  return { File: MockExpoFile };
});

jest.mock('@/api/dev-network-log', () => ({
  logAvatarUploadFormDataPart: jest.fn(),
}));

import {
  buildChangeEmailPath,
  buildChangePasswordPath,
  buildCurrentProfilePath,
  buildDeleteAccountPath,
  buildProfileStatisticsPath,
  buildUpdateProfilePath,
} from '@/features/profile/api/routes';
import {
  changeEmail,
  changePassword,
  deleteAccount,
  getCurrentProfile,
  getProfileStatistics,
  updateProfile,
  uploadAvatar,
} from '@/features/profile/api/profile-api';
import { api } from '@/api/client';
import { isLegacyReactNativeFormDataFilePart } from '@/api/form-data-file';

jest.mock('@/features/profile/utils/profile-timezone', () => ({
  getProfileStatisticsTimeZone: () => 'Europe/Istanbul',
}));

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    postFormData: jest.fn(),
  },
}));

describe('profile api routes', () => {
  it('builds profile routes', () => {
    expect(buildCurrentProfilePath()).toBe('/api/users/me');
    expect(buildUpdateProfilePath()).toBe('/api/users/me/profile');
    expect(buildChangeEmailPath()).toBe('/api/users/me/email');
    expect(buildChangePasswordPath()).toBe('/api/users/me/password');
    expect(buildProfileStatisticsPath()).toBe('/api/users/me/statistics');
    expect(buildDeleteAccountPath()).toBe('/api/users/me');
  });
});

describe('profile api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads current profile and statistics', async () => {
    (api.get as jest.Mock).mockResolvedValue({});
    await getCurrentProfile();
    await getProfileStatistics();
    expect(api.get).toHaveBeenCalledWith('/api/users/me', { signal: undefined });
    expect(api.get).toHaveBeenCalledWith('/api/users/me/statistics?timeZone=Europe%2FIstanbul', {
      signal: undefined,
    });
  });

  it('updates profile', async () => {
    (api.put as jest.Mock).mockResolvedValue({ displayName: 'Emre' });
    await updateProfile({ displayName: 'Emre' });
    expect(api.put).toHaveBeenCalledWith('/api/users/me/profile', { displayName: 'Emre' });
  });

  it('changes email and password', async () => {
    (api.put as jest.Mock)
      .mockResolvedValueOnce({ message: 'ok' })
      .mockResolvedValueOnce({ accessToken: 'token', user: {} });
    await changeEmail({ email: 'new@example.com', currentPassword: 'password' });
    await changePassword({ currentPassword: 'password', newPassword: 'newpassword' });
    expect(api.put).toHaveBeenCalledWith('/api/users/me/email', {
      email: 'new@example.com',
      currentPassword: 'password',
    });
    expect(api.put).toHaveBeenCalledWith('/api/users/me/password', {
      currentPassword: 'password',
      newPassword: 'newpassword',
    });
  });

  it('deletes account with password confirmation', async () => {
    (api.delete as jest.Mock).mockResolvedValue(undefined);
    await deleteAccount({ currentPassword: 'password' });
    expect(api.delete).toHaveBeenCalledWith('/api/users/me', { currentPassword: 'password' });
  });

  it('deletes account with social re-authentication', async () => {
    (api.delete as jest.Mock).mockResolvedValue(undefined);
    await deleteAccount({ provider: 'google', identityToken: 'google-id-token' });
    expect(api.delete).toHaveBeenCalledWith('/api/users/me', {
      provider: 'google',
      identityToken: 'google-id-token',
    });
  });

  it('uploads avatar using expo-file-system File multipart parts', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    (api.postFormData as jest.Mock).mockResolvedValue({ id: 'user-1' });

    await uploadAvatar({
      uri: 'file:///cache/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    expect(api.postFormData).toHaveBeenCalledWith(
      '/api/users/me/avatar',
      expect.any(FormData),
    );

    const formData = (api.postFormData as jest.Mock).mock.calls[0][1] as FormData;
    expect(formData).toBeInstanceOf(FormData);
    expect(appendSpy).toHaveBeenCalledWith('file', expect.any(Blob), 'avatar.jpg');

    const [, part] = appendSpy.mock.calls[0] as [string, unknown, string];
    expect(isLegacyReactNativeFormDataFilePart(part)).toBe(false);

    appendSpy.mockRestore();
  });
});
