import {
  openCreditsDetail,
  resetCreditsDetailNavigationForTests,
  returnFromCreditsDetail,
} from '@/features/details/shared/navigation/credits-detail-navigation';

describe('credits detail navigation', () => {
  beforeEach(() => {
    resetCreditsDetailNavigationForTests();
  });

  it('returns to the screen that opened credits', () => {
    const navigate = jest.fn();
    const router = {
      push: jest.fn(),
      navigate,
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openCreditsDetail(
      router,
      '/credits/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6?title=Interstellar',
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    returnFromCreditsDetail(router);

    expect(navigate).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
});
