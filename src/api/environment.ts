export type AppEnvironment = 'development' | 'preview' | 'production';

const PRIVATE_IPV4_RANGES = [
  /^localhost$/i,
  /^127(?:\.\d{1,3}){3}$/,
  /^10\.0\.2\.2$/,
  /^10(?:\.\d{1,3}){3}$/,
  /^192\.168(?:\.\d{1,3}){2}$/,
  /^172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/,
];

export function getAppEnvironment(): AppEnvironment {
  const value = process.env.EXPO_PUBLIC_APP_ENV?.trim().toLowerCase();

  if (value === 'production' || value === 'preview' || value === 'development') {
    return value;
  }

  return 'development';
}

export function isDevelopmentHost(hostname: string): boolean {
  return PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(hostname));
}

export function validateApiBaseUrl(url: string, environment: AppEnvironment = getAppEnvironment()): string {
  const normalized = url.replace(/\/+$/, '');

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL must be a valid absolute URL.');
  }

  if (environment === 'production') {
    if (parsed.protocol !== 'https:') {
      throw new Error('EXPO_PUBLIC_API_URL must use HTTPS in production builds.');
    }

    if (isDevelopmentHost(parsed.hostname)) {
      throw new Error(
        'EXPO_PUBLIC_API_URL cannot point to localhost, emulator, or private LAN addresses in production builds.',
      );
    }
  }

  return normalized;
}
