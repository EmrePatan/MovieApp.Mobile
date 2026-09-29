import { api } from '@/api/client';
import {
  createPassword,
  linkExternalLogin,
  unlinkExternalLogin,
} from '@/features/profile/api/credential-api';
import {
  buildCreatePasswordPath,
  buildLinkProviderPath,
  buildUnlinkProviderPath,
} from '@/features/profile/api/routes';

jest.mock('@/api/client', () => ({
  api: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('credential api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts link provider payload', async () => {
    (api.post as jest.Mock).mockResolvedValue({});
    await linkExternalLogin({
      targetProvider: 'google',
      targetIdentityToken: 'token',
      currentPassword: 'secret',
    });
    expect(api.post).toHaveBeenCalledWith(buildLinkProviderPath(), {
      targetProvider: 'google',
      targetIdentityToken: 'token',
      currentPassword: 'secret',
    });
  });

  it('deletes unlink provider with re-auth payload', async () => {
    (api.delete as jest.Mock).mockResolvedValue({});
    await unlinkExternalLogin('google', {
      reauthProvider: 'google',
      reauthIdentityToken: 'token',
    });
    expect(api.delete).toHaveBeenCalledWith(buildUnlinkProviderPath('google'), {
      reauthProvider: 'google',
      reauthIdentityToken: 'token',
    });
  });

  it('posts create password payload', async () => {
    (api.post as jest.Mock).mockResolvedValue({});
    await createPassword({
      newPassword: 'newpass123',
      provider: 'apple',
      identityToken: 'token',
    });
    expect(api.post).toHaveBeenCalledWith(buildCreatePasswordPath(), {
      newPassword: 'newpass123',
      provider: 'apple',
      identityToken: 'token',
    });
  });
});
