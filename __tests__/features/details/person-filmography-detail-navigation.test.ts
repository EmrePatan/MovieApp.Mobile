import { openPersonFilmography } from '@/features/details/shared/navigation/person-filmography-navigation';

describe('person filmography navigation', () => {
  it('pushes filmography within the person stack', () => {
    const push = jest.fn();
    const router = { push } as never;

    openPersonFilmography(router, '/person/1001/filmography');

    expect(push).toHaveBeenCalledWith('/person/1001/filmography');
  });
});
