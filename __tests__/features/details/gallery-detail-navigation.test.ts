import {
  isGalleryDetailRoute,
  openGalleryDetail,
} from '@/features/details/shared/navigation/gallery-detail-navigation';

describe('gallery detail navigation', () => {
  it('opens gallery with a single push action in the catalog stack', () => {
    const push = jest.fn();
    const router = { push } as never;

    openGalleryDetail(
      router,
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/gallery',
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/gallery',
    );
  });

  it('detects gallery detail routes in catalog and person stacks', () => {
    expect(isGalleryDetailRoute(['(tabs)', 'movie', 'id', 'gallery'])).toBe(true);
    expect(isGalleryDetailRoute(['(tabs)', 'tv', 'id', 'gallery'])).toBe(true);
    expect(isGalleryDetailRoute(['(tabs)', 'person', '42', 'gallery'])).toBe(true);
    expect(isGalleryDetailRoute(['(tabs)', 'gallery', 'movie', 'id'])).toBe(false);
  });
});
