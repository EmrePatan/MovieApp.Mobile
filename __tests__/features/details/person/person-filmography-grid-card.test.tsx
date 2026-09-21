import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { PersonFilmographyGridCard } from '@/features/details/person/components/PersonFilmographyGridCard';
import type { PersonFilmographyEntry } from '@/features/details/person/types';

const interstellar: PersonFilmographyEntry = {
  mediaType: 'movie',
  catalogId: '62c1356d-7563-44af-867e-b44bd2a895f6',
  tmdbId: 157336,
  title: 'Interstellar',
  posterPath: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
  character: 'Cooper',
  releaseDate: '2014-11-05',
};

const dallasBuyersClub: PersonFilmographyEntry = {
  mediaType: 'movie',
  catalogId: null,
  tmdbId: 152532,
  title: 'Dallas Buyers Club',
  posterPath: '/7Fdh7gUq3plvQqxRbNYhWvDABXA.jpg',
  character: 'Ron Woodroof',
  releaseDate: '2013-11-01',
};

describe('PersonFilmographyGridCard poster lifecycle', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  it('shows fallback for null posterPath entries', () => {
    render(
      <PersonFilmographyGridCard
        entry={{ ...interstellar, posterPath: null }}
        width={120}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('film-outline')).toBeTruthy();
    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
  });

  it('keeps a valid poster mounted after simulated FlatList recycling', () => {
    const { rerender } = render(
      <PersonFilmographyGridCard
        entry={interstellar}
        width={120}
        onPress={jest.fn()}
      />,
    );

    const staleOnError = screen.UNSAFE_getByType(Image).props.onError;

    rerender(
      <PersonFilmographyGridCard
        entry={dallasBuyersClub}
        width={120}
        onPress={jest.fn()}
      />,
    );

    act(() => {
      staleOnError?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.getByLabelText('Dallas Buyers Club poster')).toBeTruthy();
    expect(screen.queryByLabelText('film-outline')).toBeNull();
  });

  it('renders deterministically after unmount and remount with the same entry', () => {
    const { unmount } = render(
      <PersonFilmographyGridCard
        entry={interstellar}
        width={120}
        onPress={jest.fn()}
      />,
    );

    unmount();

    render(
      <PersonFilmographyGridCard
        entry={interstellar}
        width={120}
        onPress={jest.fn()}
      />,
    );

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.getByLabelText('Interstellar poster')).toBeTruthy();
  });
});
