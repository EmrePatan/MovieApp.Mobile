import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { useMovieCredits, useTvShowCredits } from '@/features/details/credits/hooks/useCredits';

jest.mock('@/features/details/credits/hooks/useCredits', () => ({
  useMovieCredits: jest.fn(),
  useTvShowCredits: jest.fn(),
}));

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function mockCastMember(overrides: Partial<{
  providerPersonId: number | null;
  name: string;
  character: string | null;
}> = {}) {
  return {
    providerPersonId: 1,
    name: 'Matthew McConaughey',
    character: 'Cooper',
    roles: null,
    totalEpisodeCount: null,
    profileImagePath: '/profile.jpg',
    order: 0,
    ...overrides,
  };
}

describe('CastRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTvShowCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { cast: [], crew: [] },
    });
  });

  it('renders cast names and characters', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: [mockCastMember()],
        crew: [],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} title="Interstellar" />);

    expect(screen.getByText('Cast & Crew')).toBeTruthy();
    expect(screen.getByText('Matthew McConaughey')).toBeTruthy();
    expect(screen.getByText('Cooper')).toBeTruthy();
  });

  it('previews only the first eight cast members', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: Array.from({ length: 10 }, (_, index) =>
          mockCastMember({
            providerPersonId: index + 1,
            name: `Actor ${index + 1}`,
            character: `Role ${index + 1}`,
          }),
        ),
        crew: [],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.getByText('Actor 1')).toBeTruthy();
    expect(screen.getByText('Actor 8')).toBeTruthy();
    expect(screen.queryByText('Actor 9')).toBeNull();
    expect(screen.getByLabelText('See all Cast & Crew')).toBeTruthy();
  });

  it('shows See All when crew is present even with eight or fewer cast members', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: [mockCastMember()],
        crew: [
          {
            providerPersonId: 99,
            name: 'Christopher Nolan',
            job: 'Director',
            department: 'Directing',
            profileImagePath: null,
          },
        ],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.getByLabelText('See all Cast & Crew')).toBeTruthy();
  });

  it('renders crew-only section with header and See All but no carousel', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cast: [],
        crew: [
          {
            providerPersonId: 99,
            name: 'Christopher Nolan',
            job: 'Director',
            department: 'Directing',
            profileImagePath: null,
          },
        ],
      },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.getByTestId('cast-rail-crew-only')).toBeTruthy();
    expect(screen.getByText('Cast & Crew')).toBeTruthy();
    expect(screen.getByLabelText('See all Cast & Crew')).toBeTruthy();
    expect(screen.queryByText('Christopher Nolan')).toBeNull();
  });

  it('omits the section when cast and crew are empty', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { cast: [], crew: [] },
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('cast-rail')).toBeNull();
    expect(screen.queryByTestId('cast-rail-crew-only')).toBeNull();
    expect(screen.queryByText('Cast & Crew')).toBeNull();
  });

  it('omits the section when the query fails', () => {
    (useMovieCredits as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(<CastRail contentType="movie" contentId={movieId} />);

    expect(screen.queryByTestId('cast-rail')).toBeNull();
  });
});
