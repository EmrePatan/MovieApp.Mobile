import { getAppEnvironment, validateApiBaseUrl } from './environment';

/**
 * Reads the backend API base URL from environment configuration.
 * Never hardcode URLs in application code.
 */
export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;

  if (!url || url.trim().length === 0) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not configured. Copy .env.example to .env and set the backend URL.',
    );
  }

  return validateApiBaseUrl(url, getAppEnvironment());
}

export const API_REQUEST_TIMEOUT_MS = 30_000;

export { getAppEnvironment, validateApiBaseUrl } from './environment';
