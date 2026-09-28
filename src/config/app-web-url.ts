import { getAppEnvironment, validateApiBaseUrl } from '@/api/environment';
import { getCatalogShareCanonicalHost } from '@/config/catalog-share-hosts';

function normalizeWebBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function defaultPublicShareWebBaseUrl(): string {
  return `https://${getCatalogShareCanonicalHost()}`;
}

/**
 * Public HTTPS origin for catalog share links (for example https://moviecaveapp.com).
 * Development may fall back to EXPO_PUBLIC_API_URL for local testing only.
 */
export function getAppWebBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_APP_WEB_URL?.trim();
  if (configured) {
    const environment = getAppEnvironment();
    if (environment === 'production') {
      const parsed = new URL(configured);
      if (parsed.protocol !== 'https:') {
        throw new Error('EXPO_PUBLIC_APP_WEB_URL must use HTTPS in production builds.');
      }
    }

    return normalizeWebBaseUrl(configured);
  }

  const environment = getAppEnvironment();
  if (environment === 'production' || environment === 'preview') {
    return defaultPublicShareWebBaseUrl();
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_APP_WEB_URL or EXPO_PUBLIC_API_URL must be configured.');
  }

  return normalizeWebBaseUrl(validateApiBaseUrl(apiUrl));
}
