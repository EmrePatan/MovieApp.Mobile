import { layout } from '@/theme/layout';
import { homeItemKeyExtractor, homeSectionKeyExtractor } from '@/features/home/utils/home-list-keys';
import {
  getHomeRailItemLayout,
  getHomeSectionRowLayout,
} from '@/features/home/utils/home-list-layout';
import type { HomeItem, HomeSection } from '@/features/home/types';

function createSection(overrides: Partial<HomeSection> = {}): HomeSection {
  return {
    type: 'Trending',
    title: 'Trending',
    displayOrder: 1,
    items: [],
    ...overrides,
  };
}

function createItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: 'item-1',
    contentType: 'movie',
    title: 'Test',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7,
    voteCount: 10,
    ...overrides,
  };
}

describe('home list performance helpers', () => {
  it('builds stable section keys from type and display order', () => {
    const section = createSection({ type: 'Genre', displayOrder: 4 });

    expect(homeSectionKeyExtractor(section)).toBe('Genre-4');
  });

  it('builds stable item keys from content id', () => {
    expect(homeItemKeyExtractor(createItem({ id: 'abc-123' }))).toBe('abc-123');
  });

  it('defines a fixed home section row height aligned to card layout', () => {
    expect(layout.homeSection.rowHeight).toBe(314);
    expect(layout.homeSection.cardStride).toBe(layout.posterCarousel.width + layout.cardGap);
    expect(layout.posterCarousel.width).toBe(120);
    expect(layout.posterCarousel.height).toBe(180);
  });

  it('returns predictable section row offsets for getItemLayout', () => {
    expect(getHomeSectionRowLayout(null, 0)).toEqual({
      length: 314,
      offset: 0,
      index: 0,
    });
    expect(getHomeSectionRowLayout(null, 2)).toEqual({
      length: 314,
      offset: 628,
      index: 2,
    });
  });

  it('returns predictable rail offsets for getItemLayout', () => {
    expect(getHomeRailItemLayout(null, 1)).toEqual({
      length: layout.homeSection.cardStride,
      offset: layout.homeSection.cardStride,
      index: 1,
    });
  });

  it('defines conservative vertical list batching defaults', () => {
    expect(layout.verticalList.initialNumToRender).toBeLessThanOrEqual(4);
    expect(layout.verticalList.maxToRenderPerBatch).toBeLessThanOrEqual(
      layout.verticalList.initialNumToRender,
    );
  });
});
