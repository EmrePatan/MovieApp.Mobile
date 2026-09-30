import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HomePersonalizedResponse, HomeTypeFilter } from '../types';

/** Schema version for persisted personalized Home payloads. */
export const HOME_PERSONALIZED_CACHE_SCHEMA_VERSION = 1;

/**
 * Max age before a persisted entry is ignored on read.
 * TanStack still revalidates sooner when Home is active; this bounds disk retention only.
 */
export const HOME_PERSONALIZED_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_KEY_PREFIX = 'movieapp:home-personalized:v1:';

export interface PersistedHomePersonalizedCache {
  version: number;
  cachedAt: number;
  response: HomePersonalizedResponse;
}

export function buildHomePersonalizedCacheStorageKey(
  userId: string,
  type: HomeTypeFilter,
  sectionSize: number,
  releaseRegion: string,
): string {
  return `${STORAGE_KEY_PREFIX}${userId}:${type}:${sectionSize}:${releaseRegion}`;
}

function isExpired(cachedAt: number, now = Date.now()): boolean {
  return now - cachedAt > HOME_PERSONALIZED_CACHE_MAX_AGE_MS;
}

function parsePersistedCache(raw: string): PersistedHomePersonalizedCache | null {
  try {
    const parsed = JSON.parse(raw) as PersistedHomePersonalizedCache;
    if (
      parsed?.version !== HOME_PERSONALIZED_CACHE_SCHEMA_VERSION ||
      typeof parsed.cachedAt !== 'number' ||
      !parsed.response ||
      !Array.isArray(parsed.response.sections) ||
      typeof parsed.response.isPersonalized !== 'boolean'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function readHomePersonalizedCache(
  userId: string,
  type: HomeTypeFilter,
  sectionSize: number,
  releaseRegion: string,
): Promise<HomePersonalizedResponse | null> {
  const key = buildHomePersonalizedCacheStorageKey(userId, type, sectionSize, releaseRegion);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  const parsed = parsePersistedCache(raw);
  if (!parsed || isExpired(parsed.cachedAt)) {
    await AsyncStorage.removeItem(key);
    return null;
  }

  return parsed.response;
}

export async function writeHomePersonalizedCache(
  userId: string,
  type: HomeTypeFilter,
  sectionSize: number,
  releaseRegion: string,
  response: HomePersonalizedResponse,
): Promise<void> {
  const key = buildHomePersonalizedCacheStorageKey(userId, type, sectionSize, releaseRegion);
  const record: PersistedHomePersonalizedCache = {
    version: HOME_PERSONALIZED_CACHE_SCHEMA_VERSION,
    cachedAt: Date.now(),
    response,
  };

  await AsyncStorage.setItem(key, JSON.stringify(record));
}

export async function clearHomePersonalizedCacheForUser(userId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const prefix = `${STORAGE_KEY_PREFIX}${userId}:`;
  const matching = keys.filter((key) => key.startsWith(prefix));

  if (matching.length === 0) {
    return;
  }

  await AsyncStorage.multiRemove(matching);
}
