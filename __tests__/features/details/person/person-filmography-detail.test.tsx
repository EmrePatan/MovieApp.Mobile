import { fireEvent, render, screen } from '@testing-library/react-native';
import { PersonFilmographyDetailContent } from '@/features/details/person/components/PersonFilmographyDetailContent';
import type { PersonDetailResponse } from '@/features/details/person/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: jest.fn(() => ['(tabs)', 'person', '42']),
  useFocusEffect: jest.fn((callback: () => void | (() => void)) => {
    callback();
    return undefined;
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

jest.mock('@/features/details/shared/navigation/catalog-detail-navigation', () => ({
  openCatalogDetailFromFilmography: jest.fn(),
}));

const person: PersonDetailResponse = {
  id: '11111111-1111-1111-1111-111111111111',
  tmdbId: 42,
  name: 'Jane Actor',
  profileImagePath: '/profile.jpg',
  biography: null,
  birthday: null,
  deathday: null,
  placeOfBirth: null,
  knownForDepartment: 'Acting',
  filmography: [
    {
      mediaType: 'movie',
      catalogId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      tmdbId: 1,
      title: 'Movie One',
      posterPath: '/m1.jpg',
      character: 'Lead',
      releaseDate: '2020-01-01',
    },
    {
      mediaType: 'tv',
      catalogId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      tmdbId: 2,
      title: 'Show Two',
      posterPath: '/s2.jpg',
      character: 'Guest',
      releaseDate: '2021-01-01',
    },
  ],
};

describe('PersonFilmographyDetailContent', () => {
  it('renders all filter by default', () => {
    render(<PersonFilmographyDetailContent person={person} />);

    expect(screen.getByTestId('person-filmography-grid')).toBeTruthy();
    expect(screen.getByTestId('person-filmography-grid-movie-1')).toBeTruthy();
    expect(screen.getByTestId('person-filmography-grid-tv-2')).toBeTruthy();
  });

  it('filters movies and tv', () => {
    render(<PersonFilmographyDetailContent person={person} />);

    fireEvent.press(screen.getByTestId('filmography-filter-movies'));
    expect(screen.getByTestId('person-filmography-grid-movie-1')).toBeTruthy();
    expect(screen.queryByTestId('person-filmography-grid-tv-2')).toBeNull();

    fireEvent.press(screen.getByTestId('filmography-filter-tv'));
    expect(screen.getByTestId('person-filmography-grid-tv-2')).toBeTruthy();
    expect(screen.queryByTestId('person-filmography-grid-movie-1')).toBeNull();
  });

  it('shows empty state for filter with no matches', () => {
    const movieOnlyPerson: PersonDetailResponse = {
      ...person,
      filmography: [person.filmography[0]],
    };

    render(<PersonFilmographyDetailContent person={movieOnlyPerson} />);
    fireEvent.press(screen.getByTestId('filmography-filter-tv'));

    expect(screen.getByTestId('person-filmography-detail-empty')).toBeTruthy();
  });
});
