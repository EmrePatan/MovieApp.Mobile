import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
import { parseCatalogIdFromPathname } from '@/features/details/shared/routes';

describe('detail child navigation', () => {
  const movieId = '65de321a-597a-46ec-a499-67ad9e20795e';

  it('enables edge-only iOS gestures on child destination stacks', () => {
    expect(detailChildStackScreenOptions).toEqual({
      gestureEnabled: true,
      fullScreenGestureEnabled: false,
    });
  });

  it('keeps catalog detail inactive while a child destination pathname is active', () => {
    expect(parseCatalogIdFromPathname(`/reviews/movie/${movieId}`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}`, 'movie')).toBe(movieId);
  });
});
