import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readText(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function validateAppConfig(source) {
  const errors = [];

  if (!source.includes('APP_IDENTITY.iosBundleIdentifier')) {
    errors.push('app.config.ts must bind ios.bundleIdentifier to APP_IDENTITY.');
  }

  if (!source.includes('APP_IDENTITY.androidPackage')) {
    errors.push('app.config.ts must bind android.package to APP_IDENTITY.');
  }

  if (!source.includes('APP_IDENTITY.urlScheme')) {
    errors.push('app.config.ts must bind scheme to APP_IDENTITY for deep links.');
  }

  if (!source.includes('com.movieapp.mobile')) {
    errors.push('app.config.ts APP_IDENTITY must keep com.movieapp.mobile identifiers.');
  }

  if (!source.includes('usesAppleSignIn: true')) {
    errors.push('app.config.ts must keep ios.usesAppleSignIn enabled.');
  }

  if (!source.includes('expo-notifications')) {
    errors.push('app.config.ts must include expo-notifications plugin.');
  }

  if (!source.includes('@react-native-google-signin/google-signin')) {
    errors.push('app.config.ts must include Google Sign-In plugin.');
  }

  return errors;
}

function validateAppIdentity(source) {
  const errors = [];

  if (!source.includes('com.movieapp.mobile')) {
    errors.push('config/app-identity.ts must keep com.movieapp.mobile identifiers.');
  }

  if (!source.includes("urlScheme: 'movieapp'")) {
    errors.push("config/app-identity.ts must keep urlScheme 'movieapp'.");
  }

  return errors;
}

function validateEasJson(eas) {
  const errors = [];
  const profiles = eas.build ?? {};

  for (const profile of ['development', 'preview', 'production']) {
    const config = profiles[profile];
    if (!config) {
      errors.push(`eas.json is missing build profile "${profile}".`);
      continue;
    }

    if (config.credentialsSource !== 'remote') {
      errors.push(`eas.json build.${profile}.credentialsSource must be "remote".`);
    }

    const expectedEnv =
      profile === 'development'
        ? 'development'
        : profile === 'preview'
          ? 'preview'
          : 'production';

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

const errors = [
  ...validateAppConfig(readText('app.config.ts')),
  ...validateAppIdentity(readText('config/app-identity.ts')),
  ...validateEasJson(JSON.parse(readText('eas.json'))),
];

if (errors.length > 0) {
  console.error('Production readiness validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Production readiness validation passed (repo config).');
console.log(
  'Reminder: set EAS production env vars in Expo dashboard before store builds:',
);
console.log(
  'EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, EXPO_PUBLIC_IMAGE_BASE_URL (recommended).',
);
