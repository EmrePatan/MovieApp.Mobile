import { HERO_MAX_CANDIDATES, selectHeroCandidates } from '@/features/home/utils/selectHeroCandidates';
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
  it('uses Hot This Week for personalized hero selection', () => {
    const sections = [
      createSection('HotThisWeek', [
        createItem({ id: 'hot-1' }),
        createItem({ id: 'hot-2' }),
      ]),
      createSection('RecommendedForYou', [createItem({ id: 'recommended-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['hot-1', 'hot-2']);
    expect(candidates.every((candidate) => candidate.sourceType === 'HotThisWeek')).toBe(true);
  });

  it('uses Hot This Week for cold-start hero selection', () => {
    const sections = [
      createSection('HotThisWeek', [createItem({ id: 'hot-1' })]),
      createSection('TopRated', [createItem({ id: 'top-1' })]),
      createSection('NewReleases', [createItem({ id: 'new-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, false);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['hot-1']);
  });

  it('does not use Recommended For You items for hero selection', () => {
    const sections = [
      createSection('RecommendedForYou', [createItem({ id: 'recommended-1' })]),
      createSection('HotThisWeek', [createItem({ id: 'hot-1' })]),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates.map((candidate) => candidate.item.id)).toEqual(['hot-1']);
  });

  it(`caps hero items at ${HERO_MAX_CANDIDATES}`, () => {
    const sections = [
      createSection(
        'HotThisWeek',
        Array.from({ length: 7 }, (_, index) => createItem({ id: `hot-${index + 1}` })),
      ),
    ];

    const candidates = selectHeroCandidates(sections, true);

    expect(candidates).toHaveLength(HERO_MAX_CANDIDATES);
  });

  it('removes cross-source duplicates using mediaType and contentId', () => {
    const shared = createItem({ id: 'shared-id', contentType: 'movie' });
    const sections = [
      createSection('HotThisWeek', [shared, createItem({ id: 'hot-only' })]),
      createSection('RecommendedForYou', [shared]),
    ];

    const candidates = selectHeroCandidates(sections, true);
    const keys = candidates.map((candidate) => `${candidate.item.contentType}:${candidate.item.id}`);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('movie:shared-id');
  });
});
