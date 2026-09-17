import {
  openCreditsDetail,
  resetCreditsDetailNavigationForTests,
  returnFromCreditsDetail,
} from '@/features/details/shared/navigation/credits-detail-navigation';

describe('credits detail navigation', () => {
  beforeEach(() => {
    resetCreditsDetailNavigationForTests();
  });

  it('returns to the screen that opened credits by dismissing to origin', () => {
    const dismissTo = jest.fn();
    const router = {
      push: jest.fn(),
      dismissTo,
      navigate: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openCreditsDetail(
      router,
      '/credits/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6?title=Interstellar',
      '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    );
    returnFromCreditsDetail(router);

    expect(dismissTo).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });
});
