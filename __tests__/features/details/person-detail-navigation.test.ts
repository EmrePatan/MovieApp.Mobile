import {
  openPersonDetail,
  resetPersonDetailNavigationForTests,
  returnFromPersonDetail,
} from '@/features/details/shared/navigation/person-detail-navigation';

describe('person detail navigation', () => {
  beforeEach(() => {
    resetPersonDetailNavigationForTests();
  });

  it('returns to the screen that opened the person detail', () => {
    const navigate = jest.fn();
    const back = jest.fn();
    const router = {
      push: jest.fn(),
      navigate,
      back,
      canGoBack: jest.fn(() => false),
    } as never;

    openPersonDetail(router, 1001, '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
    returnFromPersonDetail(router);

    expect(navigate).toHaveBeenCalledWith('/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(back).not.toHaveBeenCalled();
  });

  it('falls back to router.back when no return href is stored', () => {
    const back = jest.fn();
    const router = {
      push: jest.fn(),
      navigate: jest.fn(),
      back,
      canGoBack: jest.fn(() => true),
    } as never;

    returnFromPersonDetail(router);

    expect(back).toHaveBeenCalled();
  });
});
