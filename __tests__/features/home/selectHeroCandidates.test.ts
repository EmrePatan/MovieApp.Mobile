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

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['recommended']);
  });

  it('prioritizes recommended items for personalized users', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending' })]),
      createSection('RecommendedForYou', [
        createItem({ id: 'recommended-1' }),
        createItem({ id: 'recommended-2' }),
      ]),
      createSection('Popular', [createItem({ id: 'popular' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates[0].item.id).toBe('recommended-1');
    expect(candidates[1].item.id).toBe('recommended-2');
  });

  it('does not use excluded Popular items for personalized hero selection', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'rec-1' })]),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
      createSection('Popular', [createItem({ id: 'popular-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['rec-1', 'trending-1']);
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
      createSection('Trending', [createItem({ id: 'trending-1' })]),
      createSection('NewReleases', [createItem({ id: 'new-1' })]),
      createSection('TopRated', [createItem({ id: 'top-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates).toHaveLength(HERO_MAX_CANDIDATES);
    expect(candidates.filter((candidate) => candidate.sourceType === 'RecommendedForYou')).toHaveLength(3);
    expect(candidates.map((candidate) => candidate.sourceType)).toEqual([
      'RecommendedForYou',
      'RecommendedForYou',
      'RecommendedForYou',
      'Trending',
      'NewReleases',
    ]);
  });

  it('prefers Trending for cold-start hero selection', () => {
    const sections = [
      createSection('TopRated', [createItem({ id: 'top-1' })]),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
      createSection('NewReleases', [createItem({ id: 'new-1' })]),
      createSection('Popular', [createItem({ id: 'popular-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, false);

    expect(candidates[0].item.id).toBe('trending-1');
    expect(candidates.map((candidate) => candidate.item.id)).toEqual([
      'trending-1',
      'new-1',
      'top-1',
    ]);
  });

  it('falls back to New Releases and Top Rated for cold-start users', () => {
    const sections = [
      createSection('Trending', []),
      createSection('NewReleases', [createItem({ id: 'new-1' })]),
      createSection('TopRated', [createItem({ id: 'top-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, false);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['new-1', 'top-1']);
  });

  it('removes cross-source duplicates using mediaType and contentId', () => {
    const shared = createItem({ id: 'shared-id', contentType: 'movie' });
    const sections = [
      createSection('RecommendedForYou', [shared]),
      createSection('Trending', [shared, createItem({ id: 'trending-only' })]),
      createSection('TopRated', [createItem({ id: 'top-only' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);
    const keys = candidates.map((candidate) => `${candidate.item.contentType}:${candidate.item.id}`);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('movie:shared-id');
  });

  it('respects movie-only sections for movie filter results', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'movie-1', contentType: 'movie' })]),
      createSection('Trending', [createItem({ id: 'movie-2', contentType: 'movie' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.every((candidate) => candidate.item.contentType === 'movie')).toBe(true);
  });

  it('respects tv-only sections for tv filter results', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'tv-1', contentType: 'tv' })]),
      createSection('Trending', [createItem({ id: 'tv-2', contentType: 'tv' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.every((candidate) => candidate.item.contentType === 'tv')).toBe(true);
  });
});
