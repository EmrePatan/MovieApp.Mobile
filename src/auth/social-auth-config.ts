export interface GoogleSocialAuthConfig {
  webClientId: string | null;
  iosClientId: string | null;
}

export function getGoogleSocialAuthConfig(): GoogleSocialAuthConfig {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || null;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || null;

  return {
    webClientId,
    iosClientId,
  };
}

export function isGoogleSocialAuthConfigured(): boolean {
  const config = getGoogleSocialAuthConfig();
  return Boolean(config.webClientId || config.iosClientId);
}
