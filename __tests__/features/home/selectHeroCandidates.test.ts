import {
  HERO_MAX_CANDIDATES,
  selectHeroCandidates,
} from '@/features/home/utils/selectHeroCandidates';
import type { HomeItem, HomeSection } from '@/features/home/types';

function createItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: 'item-id',
    contentType: 'movie',
    title: 'Test Title',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7.5,
    voteCount: 100,
    ...overrides,
  };
}

function createSection(
  type: HomeSection['type'],
  items: HomeItem[],
  displayOrder = 1,
): HomeSection {
  return {
    type,
    title: String(type),
    items,
    displayOrder,
  };
}

describe('selectHeroCandidates', () => {
  it('never includes Continue Watching items', () => {
    const sections = [
      createSection('ContinueWatching', [createItem({ id: 'continue', contentType: 'tv' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['recommended']);
  });

  it('prioritizes recommended items first', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending' })]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended-1' }), createItem({ id: 'recommended-2' })]),
      createSection('Popular', [createItem({ id: 'popular' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates[0].item.id).toBe('recommended-1');
    expect(candidates[1].item.id).toBe('recommended-2');
  });

  it('caps recommended items for diversity when other sources exist', () => {
    const sections = [
      createSection(
        'RecommendedForYou',
        [
          createItem({ id: 'rec-1' }),
          createItem({ id: 'rec-2' }),
          createItem({ id: 'rec-3' }),
          createItem({ id: 'rec-4' }),
        ],
      ),
      createSection('Trending', [createItem({ id: 'trending-1' }), createItem({ id: 'trending-2' })]),
      createSection('Popular', [createItem({ id: 'popular-1' }), createItem({ id: 'popular-2' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates).toHaveLength(HERO_MAX_CANDIDATES);
    expect(candidates.filter((candidate) => candidate.sourceType === 'RecommendedForYou')).toHaveLength(3);
    expect(candidates.some((candidate) => candidate.sourceType === 'Trending')).toBe(true);
    expect(candidates.some((candidate) => candidate.sourceType === 'Popular')).toBe(true);
  });

  it('includes trending and popular when recommended is sparse', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'rec-1' })]),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
      createSection('Popular', [createItem({ id: 'popular-1' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual([
      'rec-1',
      'trending-1',
      'popular-1',
    ]);
  });

  it('removes cross-source duplicates using mediaType and contentId', () => {
    const shared = createItem({ id: 'shared-id', contentType: 'movie' });
    const sections = [
      createSection('RecommendedForYou', [shared]),
      createSection('Trending', [shared, createItem({ id: 'trending-only' })]),
      createSection('Popular', [createItem({ id: 'popular-only' })]),
    ];

    const candidates = selectHeroCandidates(sections);
    const keys = candidates.map((candidate) => `${candidate.item.contentType}:${candidate.item.id}`);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('movie:shared-id');
  });

  it('allows fewer than five candidates', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'rec-1' })]),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
    ];

    expect(selectHeroCandidates(sections)).toHaveLength(2);
  });

  it('respects movie-only sections for movie filter results', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'movie-1', contentType: 'movie' })]),
      createSection('Trending', [createItem({ id: 'movie-2', contentType: 'movie' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates.every((candidate) => candidate.item.contentType === 'movie')).toBe(true);
  });

  it('respects tv-only sections for tv filter results', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'tv-1', contentType: 'tv' })]),
      createSection('Trending', [createItem({ id: 'tv-2', contentType: 'tv' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates.every((candidate) => candidate.item.contentType === 'tv')).toBe(true);
  });

  it('allows both movie and tv candidates for all filter results', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'movie-1', contentType: 'movie' })]),
      createSection('Trending', [createItem({ id: 'tv-1', contentType: 'tv' })]),
    ];

    const candidates = selectHeroCandidates(sections);

    expect(candidates.map((candidate) => candidate.item.contentType)).toEqual(['movie', 'tv']);
  });
});
