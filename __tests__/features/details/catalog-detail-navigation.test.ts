jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
  trackProductMetricOnFocus: jest.fn(),
  resetProductMetricTrackingForTests: jest.fn(),
}));

import {
  getCatalogDetailWatchRegion,
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
});
