import {
  getCatalogDetailWatchRegion,
  openCatalogDetailFromLibraryStack,
  resetCatalogDetailOriginForTests,
  returnToCatalogDetailOrigin,
} from '@/features/details/shared/navigation/catalog-detail-navigation';

describe('catalog-detail-navigation watchRegion context', () => {
  beforeEach(() => {
    resetCatalogDetailOriginForTests();
  });

  it('stores contextual watchRegion when opening from discovery', () => {
    const router = { push: jest.fn(), dismissTo: jest.fn() };

    openCatalogDetailFromLibraryStack(router, 'movie-1', 'movie', 'discover', {
      libraryReturnHref: '/streaming-discover?watchRegion=US',
      watchRegion: 'US',
    });

    expect(getCatalogDetailWatchRegion()).toBe('US');
  });

  it('clears contextual watchRegion when returning to origin', () => {
    const router = { push: jest.fn(), dismissTo: jest.fn() };

    openCatalogDetailFromLibraryStack(router, 'movie-1', 'movie', 'discover', {
      libraryReturnHref: '/streaming-discover?watchRegion=US',
      watchRegion: 'US',
    });

    returnToCatalogDetailOrigin(router);

    expect(getCatalogDetailWatchRegion()).toBeNull();
    expect(router.dismissTo).toHaveBeenCalledWith('/streaming-discover?watchRegion=US');
  });
});
