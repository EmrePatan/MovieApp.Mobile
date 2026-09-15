import { render, screen } from '@testing-library/react-native';
import { PersonFilmographyPreviewSection, FILMOGRAPHY_PREVIEW_LIMIT } from '@/features/details/person/components/PersonFilmographyPreviewSection';
import type { PersonFilmographyEntry } from '@/features/details/person/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

jest.mock('@/features/details/shared/navigation/catalog-detail-navigation', () => ({
  openCatalogDetailFromFilmography: jest.fn(),
}));

function createEntry(index: number): PersonFilmographyEntry {
  return {
    mediaType: index % 2 === 0 ? 'movie' : 'tv',
    catalogId: null,
    tmdbId: index,
    title: `Title ${index}`,
    posterPath: `/poster-${index}.jpg`,
    character: 'Lead',
    releaseDate: '2020-01-01',
  };
}

describe('PersonFilmographyPreviewSection', () => {
  it('renders at most ten preview items', () => {
    const filmography = Array.from({ length: 15 }, (_, index) => createEntry(index + 1));

    render(
      <PersonFilmographyPreviewSection tmdbPersonId={42} filmography={filmography} />,
    );

    expect(screen.getAllByTestId(/^person-filmography-preview-(movie|tv)-\d+$/)).toHaveLength(
      FILMOGRAPHY_PREVIEW_LIMIT,
    );
  });

  it('shows see all only when filmography exceeds preview limit', () => {
    const shortFilmography = Array.from({ length: 8 }, (_, index) => createEntry(index + 1));
    render(
      <PersonFilmographyPreviewSection tmdbPersonId={42} filmography={shortFilmography} />,
    );
    expect(screen.queryByLabelText('See all Known For')).toBeNull();

    const longFilmography = Array.from({ length: 12 }, (_, index) => createEntry(index + 1));
    render(
      <PersonFilmographyPreviewSection tmdbPersonId={42} filmography={longFilmography} />,
    );
    expect(screen.getByLabelText('See all Known For')).toBeTruthy();
  });

  it('renders horizontal preview list', () => {
    const filmography = [createEntry(1), createEntry(2)];

    render(
      <PersonFilmographyPreviewSection tmdbPersonId={42} filmography={filmography} />,
    );

    expect(screen.getByTestId('person-filmography-preview')).toBeTruthy();
    expect(screen.getByTestId('person-filmography-preview-tv-1')).toBeTruthy();
  });
});
