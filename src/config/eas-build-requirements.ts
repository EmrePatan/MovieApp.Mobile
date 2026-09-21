export type EasBuildProfile = 'development' | 'preview' | 'production';

export const EAS_PROFILE_APP_ENV: Record<EasBuildProfile, string> = {
  development: 'development',
  preview: 'preview',
  production: 'production',
};

/** Public EAS variables that must be set in the Expo dashboard for store builds. */
export const EAS_PRODUCTION_PUBLIC_ENV_KEYS = [
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
] as const;

/** Recommended for poster/backdrop rendering; not required for API auth. */
export const EAS_PRODUCTION_RECOMMENDED_ENV_KEYS = ['EXPO_PUBLIC_IMAGE_BASE_URL'] as const;

export interface EasJsonShape {
  build?: Record<
    string,
    {
      distribution?: string;
      credentialsSource?: string;
      env?: Record<string, string>;
      android?: { buildType?: string };
    }
  >;
}

export function validateEasBuildProfiles(eas: EasJsonShape): string[] {
  const errors: string[] = [];
  const profiles = eas.build ?? {};

  for (const profile of ['development', 'preview', 'production'] as const) {
    const config = profiles[profile];
    if (!config) {
      errors.push(`eas.json is missing build profile "${profile}".`);
      continue;
    }

    if (config.credentialsSource !== 'remote') {
      errors.push(`eas.json build.${profile}.credentialsSource must be "remote".`);
    }

    const expectedEnv = EAS_PROFILE_APP_ENV[profile];
    if (config.env?.EXPO_PUBLIC_APP_ENV !== expectedEnv) {
      errors.push(
        `eas.json build.${profile}.env.EXPO_PUBLIC_APP_ENV must be "${expectedEnv}".`,
      );
    }
  }

  const production = profiles.production;
  if (production) {
    if (production.distribution !== 'store') {
      errors.push('eas.json build.production.distribution must be "store".');
    }

    if (production.android?.buildType !== 'app-bundle') {
      errors.push('eas.json build.production.android.buildType must be "app-bundle".');
    }
  }

  return errors;
}
