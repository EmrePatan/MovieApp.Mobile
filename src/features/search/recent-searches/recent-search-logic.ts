import { normalizeSearchQuery } from '../utils/search-query';
import { MAX_RECENT_SEARCHES, type RecentSearchStoredItem } from './recent-search-types';

export function normalizeRecentQueryIdentity(query: string): string {
  return normalizeSearchQuery(query).toLowerCase();
}

export function buildRecentSearchStorageKey(namespace: string): string {
  return `search-recent-${namespace}`;
}

export function resolveRecentSearchNamespace(userId: string | null | undefined): string {
  if (userId) {
    return `user.${userId}`;
  }

  return 'guest';
}

export function createRecentSearchId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function trimToMax(items: RecentSearchStoredItem[]): RecentSearchStoredItem[] {
  return items.slice(0, MAX_RECENT_SEARCHES);
}

export function parseStoredRecentSearches(raw: string | null): RecentSearchStoredItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const items: RecentSearchStoredItem[] = [];

    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }

      const record = entry as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : '';
      const accessedAt = typeof record.accessedAt === 'number' ? record.accessedAt : 0;
      const query =
        typeof record.query === 'string' && record.query.trim()
          ? record.query.trim()
          : null;

      if (!id || accessedAt <= 0 || !query) {
        continue;
      }

      if (record.kind === 'entity') {
        continue;
      }

      items.push({ id, query, accessedAt });
    }

    return trimToMax(items);
  } catch {
    return [];
  }
}

export function applyAddRecentQuery(
  items: RecentSearchStoredItem[],
  query: string,
  accessedAt: number,
): RecentSearchStoredItem[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return items;
  }

  const identity = normalizeRecentQueryIdentity(normalized);
  const existing = items.find(
    (item) => normalizeRecentQueryIdentity(item.query) === identity,
  );

  const withoutMatch = items.filter(
    (item) => normalizeRecentQueryIdentity(item.query) !== identity,
  );

  const nextItem: RecentSearchStoredItem = existing
    ? { ...existing, query: normalized, accessedAt }
    : { id: createRecentSearchId(), query: normalized, accessedAt };

  return trimToMax([nextItem, ...withoutMatch]);
}

export function applyRemoveRecentSearchItem(
  items: RecentSearchStoredItem[],
  id: string,
): RecentSearchStoredItem[] {
  return items.filter((item) => item.id !== id);
}

export function applyClearRecentSearches(): RecentSearchStoredItem[] {
  return [];
}
