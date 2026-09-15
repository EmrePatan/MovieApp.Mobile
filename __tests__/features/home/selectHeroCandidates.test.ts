import { selectHeroCandidates } from '@/features/home/utils/selectHeroCandidates';
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

  it('uses only Recommended For You for personalized hero selection', () => {
    const sections = [
      createSection('Trending', [createItem({ id: 'trending' })]),
      createSection('RecommendedForYou', [
        createItem({ id: 'recommended-1' }),
        createItem({ id: 'recommended-2' }),
      ]),
      createSection('Popular', [createItem({ id: 'popular' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual([
      'recommended-1',
      'recommended-2',
    ]);
    expect(candidates.every((candidate) => candidate.sourceType === 'RecommendedForYou')).toBe(
      true,
    );
  });

  it('does not use Trending or Popular items for personalized hero selection', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'rec-1' })]),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
      createSection('Popular', [createItem({ id: 'popular-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['rec-1']);
  });

  it('caps recommended items at the recommended hero maximum', () => {
    const sections = [
      createSection(
        'RecommendedForYou',
        [
          createItem({ id: 'rec-1' }),
          createItem({ id: 'rec-2' }),
          createItem({ id: 'rec-3' }),
          createItem({ id: 'rec-4' }),
          createItem({ id: 'rec-5' }),
          createItem({ id: 'rec-6' }),
        ],
      ),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates).toHaveLength(3);
    expect(candidates.every((candidate) => candidate.sourceType === 'RecommendedForYou')).toBe(
      true,
    );
  });

  it('returns no hero candidates for cold-start users', () => {
    const sections = [
      createSection('TopRated', [createItem({ id: 'top-1' })]),
      createSection('Trending', [createItem({ id: 'trending-1' })]),
      createSection('NewReleases', [createItem({ id: 'new-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, false);

    expect(candidates).toEqual([]);
  });

  it('removes cross-source duplicates using mediaType and contentId', () => {
    const shared = createItem({ id: 'shared-id', contentType: 'movie' });
    const sections = [
      createSection('RecommendedForYou', [shared, createItem({ id: 'rec-only' })]),
      createSection('Trending', [shared, createItem({ id: 'trending-only' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);
    const keys = candidates.map((candidate) => `${candidate.item.contentType}:${candidate.item.id}`);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('movie:shared-id');
  });
});
