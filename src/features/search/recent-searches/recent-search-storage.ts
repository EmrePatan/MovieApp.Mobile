import * as SecureStore from 'expo-secure-store';
import {
  applyAddRecentQuery,
  applyClearRecentSearches,
  applyRemoveRecentSearchItem,
  buildRecentSearchStorageKey,
  parseStoredRecentSearches,
  resolveRecentSearchNamespace,
} from './recent-search-logic';
import type { RecentSearchStoredItem } from './recent-search-types';

const writeQueues = new Map<string, Promise<unknown>>();

function enqueueWrite<T>(namespace: string, task: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(namespace) ?? Promise.resolve();
  const next = previous.then(() => task());
  writeQueues.set(
    namespace,
    next.catch(() => undefined),
  );
  return next;
}

async function readItems(namespace: string): Promise<RecentSearchStoredItem[]> {
  const raw = await SecureStore.getItemAsync(buildRecentSearchStorageKey(namespace));
  return parseStoredRecentSearches(raw);
}

async function writeItems(namespace: string, items: RecentSearchStoredItem[]): Promise<void> {
  await SecureStore.setItemAsync(
    buildRecentSearchStorageKey(namespace),
    JSON.stringify(items),
  );
}

export async function loadRecentSearches(
  userId: string | null | undefined,
): Promise<RecentSearchStoredItem[]> {
  const namespace = resolveRecentSearchNamespace(userId);
  return readItems(namespace);
}

export async function addRecentQuery(
  userId: string | null | undefined,
  query: string,
): Promise<RecentSearchStoredItem[]> {
  const namespace = resolveRecentSearchNamespace(userId);
  const accessedAt = Date.now();

  return enqueueWrite(namespace, async () => {
    const current = await readItems(namespace);
    const next = applyAddRecentQuery(current, query, accessedAt);
    await writeItems(namespace, next);
    return next;
  });
}

export async function removeRecentSearchItem(
  userId: string | null | undefined,
  id: string,
): Promise<RecentSearchStoredItem[]> {
  const namespace = resolveRecentSearchNamespace(userId);

  return enqueueWrite(namespace, async () => {
    const current = await readItems(namespace);
    const next = applyRemoveRecentSearchItem(current, id);
    await writeItems(namespace, next);
    return next;
  });
}

export async function clearRecentSearches(
  userId: string | null | undefined,
): Promise<RecentSearchStoredItem[]> {
  const namespace = resolveRecentSearchNamespace(userId);

  return enqueueWrite(namespace, async () => {
    const next = applyClearRecentSearches();
    await writeItems(namespace, next);
    return next;
  });
}

export async function clearRecentSearchesForUser(userId: string): Promise<void> {
  const namespace = resolveRecentSearchNamespace(userId);
  await SecureStore.deleteItemAsync(buildRecentSearchStorageKey(namespace));
}
