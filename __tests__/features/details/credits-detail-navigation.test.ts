import {
  isCreditsDetailRoute,
  openCreditsDetail,
} from '@/features/details/shared/navigation/credits-detail-navigation';

describe('credits detail navigation', () => {
  it('opens credits with a single push action in the catalog stack', () => {
    const push = jest.fn();
    const router = { push } as never;

    openCreditsDetail(
      router,
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/credits?title=Interstellar',
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/credits?title=Interstellar',
    );
  });

  it('detects credits detail routes in the catalog stack', () => {
    expect(isCreditsDetailRoute(['movie', 'id', 'credits'])).toBe(true);
    expect(isCreditsDetailRoute(['tv', 'id', 'credits'])).toBe(true);
    expect(isCreditsDetailRoute(['(tabs)', 'credits', 'movie', 'id'])).toBe(false);
  });
});
