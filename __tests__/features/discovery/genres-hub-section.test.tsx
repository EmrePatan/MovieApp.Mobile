import { fireEvent, render, screen } from '@testing-library/react-native';
import { GenresDirectoryScreen } from '@/features/discovery/components/GenresDirectoryScreen';
import { GenresHubSection } from '@/features/discovery/components/GenresHubSection';
import type { Genre } from '@/features/discovery/types';

const mockPush = jest.fn();

const coverCandidates: Record<
  string,
  { id: string; type: 'movie'; title: string; posterUrl: string | null }[]
> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, dismissTo: jest.fn(), canGoBack: () => false }),
  useSegments: () => ['discover-genres'],
}));

const batchCoverResponse = {
  items: [] as Array<{
    genreId: string;
    candidates: { id: string; type: 'movie'; title: string; posterUrl: string | null }[];
  }>,
};

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
  useQuery: () => ({
    isLoading: false,
    isPending: false,
    isError: false,
    status: 'success',
    fetchStatus: 'idle',
    dataUpdatedAt: 1,
    data: batchCoverResponse,
  }),
}));

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: jest.fn(),
}));

function genre(id: string, name: string): Genre {
  return { id, name };
}

const catalog: Genre[] = [
  genre('g-news', 'News'),
  genre('g-adventure', 'Adventure'),
  genre('g-animation', 'Animation'),
  genre('g-crime', 'Crime'),
  genre('g-horror', 'Horror'),
  genre('g-thriller', 'Thriller'),
  genre('g-documentary', 'Documentary'),
  genre('g-family', 'Family'),
  genre('g-history', 'History'),
  genre('g-music', 'Music'),
  genre('g-western', 'Western'),
  genre('g-kids', 'Kids'),
  genre('g-reality', 'Reality'),
  genre('g-soap', 'Soap'),
  genre('g-talk', 'Talk'),
  genre('g-tv-movie', 'TV Movie'),
  genre('g-combined', 'Action & Adventure'),
  genre('g-war', 'War'),
  genre('g-romance', 'Romance'),
  genre('g-mystery', 'Mystery'),
  genre('g-fantasy', 'Fantasy'),
  genre('g-scifi', 'Science Fiction'),
  genre('g-comedy', 'Comedy'),
  genre('g-drama', 'Drama'),
  genre('g-action', 'Action'),
];

function poster(id: string, title: string, posterUrl = `/${id}.jpg`) {
  return {
    id,
    type: 'movie' as const,
    title,
    posterUrl,
  };
}

describe('GenresHubSection', () => {
  beforeEach(() => {
    mockPush.mockClear();
    for (const key of Object.keys(coverCandidates)) {
      delete coverCandidates[key];
    }

    const { useGenres } = jest.requireMock('@/features/discovery/hooks/useGenres') as {
      useGenres: jest.Mock;
    };
    useGenres.mockReturnValue({
      data: catalog,
      isLoading: false,
      isError: false,
    });

    coverCandidates['g-action'] = [
      poster('rank-1', 'Rank 1'),
      poster('spider', 'Spider-Man'),
      poster('mad-max', 'Mad Max'),
    ];
    coverCandidates['g-drama'] = [
      poster('d-1', 'Drama 1'),
      poster('notebook', 'The Notebook'),
      poster('spider-drama', 'Spider-Man'),
    ];
    for (const item of catalog) {
      if (item.id === 'g-action' || item.id === 'g-drama') {
        continue;
      }
      coverCandidates[item.id] = [
        poster(`${item.id}-1`, `${item.name} 1`),
        poster(`${item.id}-title`, `${item.name} Cover`),
      ];
    }
    coverCandidates['g-war'] = [poster('spider-war', 'Spider-Man')];

    batchCoverResponse.items = Object.entries(coverCandidates).map(([genreId, candidates]) => ({
      genreId,
      status: 'ok' as const,
      candidates,
    }));
  });

  it('renders exactly eight rail genres and leaves the rest for See All', () => {
    render(<GenresHubSection />);

    const railIds = [
      'g-scifi',
      'g-fantasy',
      'g-mystery',
      'g-action',
      'g-drama',
      'g-comedy',
      'g-romance',
      'g-war',
    ];
    for (const id of railIds) {
      expect(screen.getByTestId(`genre-hub-tile-${id}`)).toBeTruthy();
    }

    expect(screen.queryByTestId('genre-hub-tile-g-adventure')).toBeNull();
    expect(screen.queryByTestId('genre-hub-tile-g-animation')).toBeNull();
    expect(screen.queryByTestId('genre-hub-tile-g-news')).toBeNull();
    expect(screen.queryByTestId('genre-hub-tile-g-tv-movie')).toBeNull();
    expect(screen.getAllByTestId(/^genre-hub-tile-/)).toHaveLength(8);

    expect(screen.getByTestId('genre-hub-cover-g-action').props.accessibilityLabel).toBe('Spider-Man');
    expect(screen.getByTestId('genre-hub-cover-g-drama').props.accessibilityLabel).toBe('The Notebook');
    expect(screen.getByTestId('genre-hub-fallback-g-war')).toBeTruthy();
    expect(screen.queryByTestId('genre-hub-cover-g-war')).toBeNull();

    fireEvent.press(screen.getByTestId('genres-hub-see-all'));
    expect(mockPush).toHaveBeenCalledWith('/discover-genres');
  });

  it('opens the tapped genre from the rail', () => {
    render(<GenresHubSection />);

    fireEvent.press(screen.getByTestId('genre-hub-tile-g-action'));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('mode=popular'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('genres=g-action'));
  });
});

describe('GenresDirectoryScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    for (const key of Object.keys(coverCandidates)) {
      delete coverCandidates[key];
    }

    const { useGenres } = jest.requireMock('@/features/discovery/hooks/useGenres') as {
      useGenres: jest.Mock;
    };
    useGenres.mockReturnValue({
      data: catalog,
      isLoading: false,
      isError: false,
    });

    let index = 0;
    for (const item of catalog) {
      index += 1;
      coverCandidates[item.id] = [
        poster(`title-${index}-1`, `Cover ${index} 1`),
        poster(`title-${index}`, `Cover ${index}`),
      ];
    }
    coverCandidates['g-action'] = [
      poster('rank-1', 'Rank 1'),
      poster('spider', 'Spider-Man'),
      poster('mad-max', 'Mad Max'),
    ];
    coverCandidates['g-adventure'] = [
      poster('adv-1', 'Adv 1'),
      poster('indiana', 'Indiana Jones'),
      poster('spider-adventure', 'Spider-Man'),
    ];

    batchCoverResponse.items = Object.entries(coverCandidates).map(([genreId, candidates]) => ({
      genreId,
      status: 'ok' as const,
      candidates,
    }));
  });

  it('includes the rail genres and the See All-only genres without duplicating War', () => {
    render(<GenresDirectoryScreen />);

    expect(screen.getByTestId('discover-genres-directory')).toBeTruthy();
    expect(screen.getAllByTestId(/^genre-hub-tile-/)).toHaveLength(23);
    expect(screen.getByTestId('genre-hub-tile-g-action')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-war')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-adventure')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-animation')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-crime')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-horror')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-thriller')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-documentary')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-news')).toBeTruthy();
    expect(screen.getByTestId('genre-hub-tile-g-talk')).toBeTruthy();
    expect(screen.queryByTestId('genre-hub-tile-g-tv-movie')).toBeNull();
    expect(screen.queryByTestId('genre-hub-tile-g-combined')).toBeNull();
    expect(screen.getAllByText('War')).toHaveLength(1);

    expect(screen.getByTestId('genre-hub-cover-g-action').props.accessibilityLabel).toBe('Spider-Man');
    expect(screen.getByTestId('genre-hub-cover-g-adventure').props.accessibilityLabel).toBe(
      'Indiana Jones',
    );
  });
});
