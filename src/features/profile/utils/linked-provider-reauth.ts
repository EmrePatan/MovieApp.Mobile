import {
  requestSocialIdentityToken,
  SocialAuthCancelledError,
} from '@/auth/social-auth-service';
import type { SocialAuthProvider } from '@/models/api/auth';

export type LinkedProviderChoiceHandler = (
  providers: readonly SocialAuthProvider[],
) => Promise<SocialAuthProvider | null>;

export async function obtainLinkedProviderReauth(
  linkedProviders: readonly SocialAuthProvider[],
  chooseProvider: LinkedProviderChoiceHandler,
): Promise<{ provider: SocialAuthProvider; identityToken: string }> {
  if (linkedProviders.length === 0) {
    throw new Error('No linked providers available for re-authentication.');
  }

  const provider =
    linkedProviders.length === 1
      ? linkedProviders[0]
      : await chooseProvider(linkedProviders);

  if (!provider) {
    throw new SocialAuthCancelledError();
  }

  const identityToken = await requestSocialIdentityToken(provider);
  return { provider, identityToken };
}
