import {
  openGalleryDetail,
  resetGalleryDetailNavigationForTests,
  returnFromGalleryDetail,
} from '@/features/details/shared/navigation/gallery-detail-navigation';

describe('gallery detail navigation', () => {
  beforeEach(() => {
    resetGalleryDetailNavigationForTests();
  });

  it('returns to the screen that opened the gallery by dismissing to origin', () => {
    const dismissTo = jest.fn();
    const router = {
      push: jest.fn(),
      dismissTo,
      navigate: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openGalleryDetail(
      router,
      '/gallery/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    returnFromGalleryDetail(router);

    expect(dismissTo).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
});
