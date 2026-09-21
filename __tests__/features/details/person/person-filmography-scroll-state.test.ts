import {
  getPersonFilmographyScrollOffset,
  resetPersonFilmographyScrollStateForTests,
  setPersonFilmographyScrollOffset,
} from '@/features/details/person/utils/person-filmography-scroll-state';

describe('person-filmography-scroll-state', () => {
  beforeEach(() => {
    resetPersonFilmographyScrollStateForTests();
  });

  it('stores and restores scroll offsets per person', () => {
    setPersonFilmographyScrollOffset(1001, 240);
    setPersonFilmographyScrollOffset(2002, 80);

    expect(getPersonFilmographyScrollOffset(1001)).toBe(240);
    expect(getPersonFilmographyScrollOffset(2002)).toBe(80);
    expect(getPersonFilmographyScrollOffset(3003)).toBe(0);
  });
});
