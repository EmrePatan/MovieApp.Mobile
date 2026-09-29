import {
  applyAddRecentEntity,
  applyAddRecentQuery,
  applyClearRecentSearches,
  applyRemoveRecentSearchItem,
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
    expect(first[0].kind).toBe('query');
    expect(first[0].query).toBe('Inception');

    const second = applyAddRecentQuery(first, 'inception', t1);
    expect(second).toHaveLength(1);
    expect(second[0].id).toBe(first[0].id);
    expect(second[0].accessedAt).toBe(t1);
  });

  it('persists and promotes entities', () => {
    const first = applyAddRecentEntity(
      [],
      {
        entityType: 'movie',
        catalogId: 'movie-1',
        title: 'Interstellar',
      },
      t0,
    );

    const second = applyAddRecentEntity(
      first,
      {
        entityType: 'movie',
        catalogId: 'movie-1',
        title: 'Interstellar',
      },
      t1,
    );

    expect(second).toHaveLength(1);
    expect(second[0].id).toBe(first[0].id);
    expect(second[0].accessedAt).toBe(t1);
  });

  it('replaces redundant query when entity title matches', () => {
    const withQuery = applyAddRecentQuery([], 'Interstellar', t0);
    const withEntity = applyAddRecentEntity(
      withQuery,
      {
        entityType: 'movie',
        catalogId: 'movie-1',
        title: 'Interstellar',
      },
      t1,
    );

    expect(withEntity).toHaveLength(1);
    expect(withEntity[0].kind).toBe('entity');
  });

  it('enforces max item count', () => {
    let items = applyAddRecentQuery([], 'first', t0);
    for (let index = 0; index < MAX_RECENT_SEARCHES + 5; index += 1) {
      items = applyAddRecentQuery(items, `query-${index}`, t0 + index);
    }

    expect(items).toHaveLength(MAX_RECENT_SEARCHES);
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

  it('parses valid stored entities with catalogId', () => {
    const raw = JSON.stringify([
      {
        id: 'row-1',
        kind: 'entity',
        entityType: 'person',
        catalogId: 'person-1',
        tmdbId: 42,
        title: 'Ada',
        accessedAt: t0,
      },
    ]);

    const parsed = parseStoredRecentSearches(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].kind).toBe('entity');
    if (parsed[0].kind === 'entity') {
      expect(parsed[0].catalogId).toBe('person-1');
      expect(parsed[0].tmdbId).toBe(42);
    }
  });

  it('isolates namespaces', () => {
    expect(resolveRecentSearchNamespace(null)).toBe('guest');
    expect(resolveRecentSearchNamespace('abc')).toBe('user:abc');
  });
});
