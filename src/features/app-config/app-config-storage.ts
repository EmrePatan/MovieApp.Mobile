import * as SecureStore from 'expo-secure-store';
import type { CachedAppConfigRecord, RemoteAppConfig } from './types';
import { mergeWithDefaultRemoteAppConfig, parseRemoteAppConfig } from './parse-remote-app-config';

const APP_CONFIG_STORAGE_KEY = 'movieapp.remoteAppConfig.v1';

export async function loadCachedAppConfig(): Promise<CachedAppConfigRecord | null> {
  const raw = await SecureStore.getItemAsync(APP_CONFIG_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { config?: unknown; fetchedAt?: unknown };
    const config = parseRemoteAppConfig(parsed.config);
    const fetchedAt = typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : null;

    if (!config || fetchedAt === null) {
      return null;
    }

    return {
      config: mergeWithDefaultRemoteAppConfig(config),
      fetchedAt,
    };
  } catch {
    return null;
  }
}

export async function saveCachedAppConfig(config: RemoteAppConfig): Promise<void> {
  const record: CachedAppConfigRecord = {
    config: mergeWithDefaultRemoteAppConfig(config),
    fetchedAt: Date.now(),
  };

  await SecureStore.setItemAsync(APP_CONFIG_STORAGE_KEY, JSON.stringify(record));
}
