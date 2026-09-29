import { normalizeSearchQuery } from '../utils/search-query';
import {
  MAX_RECENT_SEARCHES,
  type RecentSearchEntityPayload,
  type RecentSearchStoredItem,
} from './recent-search-types';

export function normalizeRecentQueryIdentity(query: string): string {
  return normalizeSearchQuery(query).toLowerCase();
}

export function buildRecentSearchStorageKey(namespace: string): string {
  return `search-recent-${namespace}`;
}

export function resolveRecentSearchNamespace(userId: string | null | undefined): string {
  if (userId) {
    return `user:${userId}`;
  }

  return 'guest';
}

export function createRecentSearchId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function entityIdentityKey(
  entity: Pick<RecentSearchEntityPayload, 'entityType' | 'catalogId' | 'tmdbId' | 'title'>,
): string {
  if (entity.entityType === 'person') {
    if (entity.tmdbId != null) {
      return `person:tmdb:${entity.tmdbId}`;
    }

    if (entity.catalogId) {
      return `person:id:${entity.catalogId}`;
    }
  }

  if (entity.catalogId) {
    return `${entity.entityType}:${entity.catalogId}`;
  }

  if (entity.tmdbId != null) {
    return `${entity.entityType}:tmdb:${entity.tmdbId}`;
  }

  return `${entity.entityType}:title:${normalizeRecentQueryIdentity(entity.title)}`;
}

function trimToMax(items: RecentSearchStoredItem[]): RecentSearchStoredItem[] {
  return items.slice(0, MAX_RECENT_SEARCHES);
}

function queryMatchesEntityTitle(query: string, entityTitle: string): boolean {
  return normalizeRecentQueryIdentity(query) === normalizeRecentQueryIdentity(entityTitle);
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
      const kind = record.kind;

      if (!id || accessedAt <= 0) {
        continue;
      }

      if (kind === 'query' && typeof record.query === 'string' && record.query.trim()) {
        items.push({
          id,
          kind: 'query',
          query: record.query.trim(),
          accessedAt,
        });
        continue;
      }

      if (
        kind === 'entity' &&
        (record.entityType === 'movie' || record.entityType === 'tv' || record.entityType === 'person') &&
        typeof record.title === 'string' &&
        record.title.trim()
      ) {
        const stored: RecentSearchStoredItem = {
          id,
          kind: 'entity',
          entityType: record.entityType,
          title: record.title.trim(),
          accessedAt,
          posterUrl:
            record.posterUrl === null || typeof record.posterUrl === 'string'
              ? record.posterUrl
              : undefined,
        };

        if (typeof record.catalogId === 'string' && record.catalogId) {
          stored.catalogId = record.catalogId;
        }

        if (typeof record.tmdbId === 'number' && Number.isFinite(record.tmdbId)) {
          stored.tmdbId = record.tmdbId;
        }

        items.push(stored);
      }
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
    (item): item is Extract<RecentSearchStoredItem, { kind: 'query' }> =>
      item.kind === 'query' && normalizeRecentQueryIdentity(item.query) === identity,
  );

  const withoutMatch = items.filter((item) => {
    if (item.kind === 'query' && normalizeRecentQueryIdentity(item.query) === identity) {
      return false;
    }

    return true;
  });

  const nextItem: RecentSearchStoredItem = existing
    ? { ...existing, query: normalized, accessedAt }
    : { id: createRecentSearchId(), kind: 'query', query: normalized, accessedAt };

  return trimToMax([nextItem, ...withoutMatch]);
}

export function applyAddRecentEntity(
  items: RecentSearchStoredItem[],
  entity: Omit<RecentSearchEntityPayload, 'accessedAt'>,
  accessedAt: number,
): RecentSearchStoredItem[] {
  const title = normalizeSearchQuery(entity.title);
  if (!title) {
    return items;
  }

  const identity = entityIdentityKey({ ...entity, title });
  const existing = items.find(
    (item): item is Extract<RecentSearchStoredItem, { kind: 'entity' }> =>
      item.kind === 'entity' && entityIdentityKey(item) === identity,
  );

  const withoutRelated = items.filter((item) => {
    if (item.kind === 'entity' && entityIdentityKey(item) === identity) {
      return false;
    }

    if (item.kind === 'query' && queryMatchesEntityTitle(item.query, title)) {
      return false;
    }

    return true;
  });

  const nextItem: RecentSearchStoredItem = existing
    ? {
        ...existing,
        ...entity,
        title,
        accessedAt,
        kind: 'entity',
      }
    : {
        id: createRecentSearchId(),
        kind: 'entity',
        ...entity,
        title,
        accessedAt,
      };

  return trimToMax([nextItem, ...withoutRelated]);
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
