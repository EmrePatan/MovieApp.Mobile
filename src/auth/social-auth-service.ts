import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform, TurboModuleRegistry } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { getGoogleSocialAuthConfig, isGoogleSocialAuthConfigured } from './social-auth-config';
import type { SocialAuthProvider } from '@/models/api/auth';

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

export class SocialAuthCancelledError extends Error {
  constructor() {
    super('Social sign-in was cancelled.');
    this.name = 'SocialAuthCancelledError';
  }
}

export class SocialAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SocialAuthConfigurationError';
  }
}

let googleConfigured = false;
let googleSigninModulePromise: Promise<GoogleSigninModule> | null = null;

function isGoogleNativeModuleAvailable(): boolean {
  return TurboModuleRegistry.get('RNGoogleSignin') != null;
}

async function loadGoogleSigninModule(): Promise<GoogleSigninModule> {
  if (!isGoogleNativeModuleAvailable()) {
    throw new SocialAuthConfigurationError(
      'Google sign-in is not available in this build. Rebuild the dev client with `npx expo run:ios` or `npx expo run:android`.',
    );
  }

  googleSigninModulePromise ??= import('@react-native-google-signin/google-signin');
  return googleSigninModulePromise;
}

async function ensureGoogleConfigured(): Promise<GoogleSigninModule> {
  const googleSignin = await loadGoogleSigninModule();

  if (googleConfigured) {
    return googleSignin;
  }

  const config = getGoogleSocialAuthConfig();
  if (!isGoogleSocialAuthConfigured()) {
    throw new SocialAuthConfigurationError('Google sign-in is not configured for this build.');
  }

  googleSignin.GoogleSignin.configure({
    webClientId: config.webClientId ?? undefined,
    iosClientId: config.iosClientId ?? undefined,
    offlineAccess: false,
  });

  googleConfigured = true;
  return googleSignin;
}

function isAppleNativeModuleAvailable(): boolean {
  return Platform.OS === 'ios' && requireOptionalNativeModule('ExpoAppleAuthentication') != null;
}

export function isAppleSocialAuthAvailable(): boolean {
  return isAppleNativeModuleAvailable();
}

export function isGoogleSocialAuthAvailable(): boolean {
  return (Platform.OS === 'ios' || Platform.OS === 'android') && isGoogleNativeModuleAvailable();
}

export async function requestSocialIdentityToken(provider: SocialAuthProvider): Promise<string> {
  if (provider === 'google') {
    return requestGoogleIdentityToken();
  }

  return requestAppleIdentityToken();
}

type GoogleSignInClient = {
  hasPlayServices: (options: { showPlayServicesUpdateDialog: boolean }) => Promise<boolean>;
  signOut: () => Promise<null>;
  signIn: () => Promise<import('@react-native-google-signin/google-signin').SignInResponse>;
};

export async function prepareGoogleSignInForAccountSelection(
  platform: typeof Platform.OS,
  googleSignin: GoogleSignInClient,
): Promise<void> {
  if (platform !== 'android') {
    return;
  }

  await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    await googleSignin.signOut();
  } catch {
    // Best-effort: still attempt sign-in if clearing the cached account fails.
  }
}

async function requestGoogleIdentityToken(): Promise<string> {
  if (!isGoogleSocialAuthAvailable()) {
    throw new SocialAuthConfigurationError('Google sign-in is not available on this platform.');
  }

  const { GoogleSignin, isCancelledResponse, isErrorWithCode, statusCodes } =
    await ensureGoogleConfigured();

  await prepareGoogleSignInForAccountSelection(Platform.OS, GoogleSignin);

  try {
    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      throw new SocialAuthCancelledError();
    }

    const idToken = response.data?.idToken;
    if (!idToken) {
      throw new Error('Google did not return an identity token.');
    }

    return idToken;
  } catch (error) {
    if (error instanceof SocialAuthCancelledError) {
      throw error;
    }

    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new SocialAuthCancelledError();
    }

    throw error;
  }
}

async function requestAppleIdentityToken(): Promise<string> {
  if (Platform.OS !== 'ios') {
    throw new SocialAuthConfigurationError('Apple sign-in is only available on iOS.');
  }

  if (!isAppleNativeModuleAvailable()) {
    throw new SocialAuthConfigurationError(
      'Apple sign-in is not available in this build. Rebuild the dev client with `npx expo run:ios`.',
    );
  }

  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new SocialAuthConfigurationError('Apple sign-in is not available on this device.');
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple did not return an identity token.');
    }

    return credential.identityToken;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      throw new SocialAuthCancelledError();
    }

    throw error;
  }
}
