import { requestSocialIdentityToken, SocialAuthCancelledError } from '@/auth/social-auth-service';
import { obtainLinkedProviderReauth } from '@/features/profile/utils/linked-provider-reauth';

describe('obtainLinkedProviderReauth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requestSocialIdentityToken as jest.Mock).mockResolvedValue('token');
  });

  it('uses the only linked provider without prompting', async () => {
    const result = await obtainLinkedProviderReauth(['google'], jest.fn());

    expect(result.provider).toBe('google');
    expect(requestSocialIdentityToken).toHaveBeenCalledWith('google');
  });

  it('prompts when multiple providers are linked', async () => {
    const chooseProvider = jest.fn().mockResolvedValue('apple');

    const result = await obtainLinkedProviderReauth(['google', 'apple'], chooseProvider);

    expect(chooseProvider).toHaveBeenCalledWith(['google', 'apple']);
    expect(result.provider).toBe('apple');
    expect(requestSocialIdentityToken).toHaveBeenCalledWith('apple');
  });

  it('throws cancellation when choice is dismissed', async () => {
    await expect(
      obtainLinkedProviderReauth(['google', 'apple'], jest.fn().mockResolvedValue(null)),
    ).rejects.toBeInstanceOf(SocialAuthCancelledError);
  });
});
