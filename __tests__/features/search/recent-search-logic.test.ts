import {
  applyAddRecentQuery,
  applyClearRecentSearches,
  applyRemoveRecentSearchItem,
  buildRecentSearchStorageKey,
  normalizeRecentQueryIdentity,
  parseStoredRecentSearches,
  resolveRecentSearchNamespace,
} from '@/features/search/recent-searches/recent-search-logic';
import { MAX_RECENT_SEARCHES } from '@/features/search/recent-searches/recent-search-types';

describe('recent-search-logic', () => {
  const t0 = 1_000;
  const t1 = 2_000;

  it('normalizes query identity for dedupe', () => {
    expect(normalizeRecentQueryIdentity('  Inter  Stellar ')).toBe('inter stellar');
  });

  it('persists and promotes queries', () => {
    const first = applyAddRecentQuery([], 'Inception', t0);
    expect(first).toHaveLength(1);
    expect(first[0].query).toBe('Inception');

    const second = applyAddRecentQuery(first, 'inception', t1);
    expect(second).toHaveLength(1);
    expect(second[0].id).toBe(first[0].id);
    expect(second[0].accessedAt).toBe(t1);
  });

  it('enforces max item count and drops oldest on sixth unique query', () => {
    let items = applyAddRecentQuery([], 'q1', t0);
    items = applyAddRecentQuery(items, 'q2', t0 + 1);
    items = applyAddRecentQuery(items, 'q3', t0 + 2);
    items = applyAddRecentQuery(items, 'q4', t0 + 3);
    items = applyAddRecentQuery(items, 'q5', t0 + 4);
    expect(items).toHaveLength(MAX_RECENT_SEARCHES);
    expect(items[0].query).toBe('q5');

    items = applyAddRecentQuery(items, 'q6', t0 + 5);
    expect(items).toHaveLength(MAX_RECENT_SEARCHES);
    expect(items[0].query).toBe('q6');
    expect(items.map((item) => item.query)).not.toContain('q1');
  });

  it('removes one item and clears all', () => {
    const items = applyAddRecentQuery([], 'alpha', t0);
    const withBeta = applyAddRecentQuery(items, 'beta', t1);
    const removed = applyRemoveRecentSearchItem(withBeta, withBeta[0].id);
    expect(removed).toHaveLength(1);
    expect(applyClearRecentSearches()).toEqual([]);
  });

  it('parses malformed storage as empty', () => {
    expect(parseStoredRecentSearches('not-json')).toEqual([]);
    expect(parseStoredRecentSearches('{"bad":true}')).toEqual([]);
  });

  it('ignores legacy entity rows when parsing', () => {
    const raw = JSON.stringify([
      {
        id: 'row-1',
        kind: 'entity',
        entityType: 'person',
        title: 'Ada',
        accessedAt: t0,
      },
      {
        id: 'row-2',
        kind: 'query',
        query: 'nolan',
        accessedAt: t1,
      },
    ]);

    const parsed = parseStoredRecentSearches(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].query).toBe('nolan');
  });

  it('isolates namespaces', () => {
    expect(resolveRecentSearchNamespace(null)).toBe('guest');
    expect(resolveRecentSearchNamespace('abc')).toBe('user.abc');
  });

  it('builds SecureStore-safe storage keys without colon', () => {
    expect(buildRecentSearchStorageKey('guest')).toBe('search-recent-guest');

    const authenticatedKey = buildRecentSearchStorageKey(resolveRecentSearchNamespace('abc'));
    expect(authenticatedKey).toBe('search-recent-user.abc');
    expect(authenticatedKey).not.toContain(':');
  });
});
