jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
  trackProductMetricOnFocus: jest.fn(),
  resetProductMetricTrackingForTests: jest.fn(),
}));

import {
  getCatalogDetailWatchRegion,
  openCatalogDetailFromDetail,
  openCatalogDetailFromLibraryStack,
  openCatalogDetailFromTab,
  resetCatalogDetailOriginForTests,
} from '@/features/details/shared/navigation/catalog-detail-navigation';

describe('catalog-detail-navigation watchRegion context', () => {
  beforeEach(() => {
    resetCatalogDetailOriginForTests();
  });

  it('stores contextual watchRegion when opening from discovery', () => {
    const router = { push: jest.fn() };

    openCatalogDetailFromLibraryStack(router, 'movie-1', 'movie', 'discover', {
      watchRegion: 'US',
    });

    expect(getCatalogDetailWatchRegion()).toBe('US');
  });

  it('ignores duplicate catalog detail pushes within the debounce window', () => {
    const router = { push: jest.fn() };

    openCatalogDetailFromTab(router, 'movie-1', 'movie', 'search');
    openCatalogDetailFromTab(router, 'movie-1', 'movie', 'search');

    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('dedupes library stack catalog detail pushes', () => {
    const router = { push: jest.fn() };

    openCatalogDetailFromLibraryStack(router, 'movie-1', 'movie', 'upcoming');
    openCatalogDetailFromLibraryStack(router, 'movie-1', 'movie', 'upcoming');

    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('pushes one detail entry per recommendation tap burst from a detail screen', () => {
    const router = { push: jest.fn() };

    openCatalogDetailFromDetail(router, 'tv-2', 'tv');
    openCatalogDetailFromDetail(router, 'tv-2', 'tv');

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/tv/tv-2');
  });
});
