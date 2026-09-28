import { getApiBaseUrl } from '@/api/config';
import { getUiFormatLocaleTag } from '@/i18n';
import { mergeWithDefaultRemoteAppConfig, parseRemoteAppConfig } from './parse-remote-app-config';
import type { RemoteAppConfig } from './types';

export const APP_CONFIG_FETCH_TIMEOUT_MS = 4_000;

export async function fetchRemoteAppConfig(
  signal?: AbortSignal,
): Promise<RemoteAppConfig | null> {
  const url = `${getApiBaseUrl()}/api/public/app-config`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG_FETCH_TIMEOUT_MS);

  const abortListener = () => controller.abort();
  signal?.addEventListener('abort', abortListener);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': getUiFormatLocaleTag(),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const parsed = parseRemoteAppConfig(payload);
    return parsed ? mergeWithDefaultRemoteAppConfig(parsed) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortListener);
  }
}
