import {
  openPersonFilmography,
  resetPersonFilmographyNavigationForTests,
  returnFromPersonFilmography,
} from '@/features/details/shared/navigation/person-filmography-navigation';

describe('person filmography navigation', () => {
  beforeEach(() => {
    resetPersonFilmographyNavigationForTests();
  });

  it('returns to the person detail screen that opened filmography', () => {
    const navigate = jest.fn();
    const router = {
      push: jest.fn(),
      navigate,
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    } as never;

    openPersonFilmography(router, '/person/1001/filmography', '/person/1001');
    returnFromPersonFilmography(router);

    expect(navigate).toHaveBeenCalledWith('/person/1001');
  });
});
