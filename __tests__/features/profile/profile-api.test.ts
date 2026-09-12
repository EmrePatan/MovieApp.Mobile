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
} from '@/features/profile/api/profile-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
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
    expect(api.get).toHaveBeenCalledWith('/api/users/me/statistics', { signal: undefined });
  });

  it('updates profile', async () => {
    (api.put as jest.Mock).mockResolvedValue({ displayName: 'Emre' });
    await updateProfile({ displayName: 'Emre' });
    expect(api.put).toHaveBeenCalledWith('/api/users/me/profile', { displayName: 'Emre' });
  });

  it('changes email and password', async () => {
    (api.put as jest.Mock).mockResolvedValue({ accessToken: 'token', user: {} });
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
});
