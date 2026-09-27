import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../utils/render-with-providers';
import { DetailHero } from '@/features/details/shared/components/DetailHero';
import { useMovieVideos, useTvShowVideos } from '@/features/details/videos/hooks/useVideos';

jest.mock('@/features/details/videos/hooks/useVideos', () => ({
  useMovieVideos: jest.fn(),
  useTvShowVideos: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
  useFocusEffect: jest.fn((callback: () => void | (() => void)) => {
    callback();
    return undefined;
  }),
}));

const mockUseMovieVideos = useMovieVideos as jest.Mock;
const mockUseTvShowVideos = useTvShowVideos as jest.Mock;

const validWatchUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('detail hero inline trailer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMovieVideos.mockReturnValue({
      data: { primary: { watchUrl: validWatchUrl } },
      isLoading: false,
      isError: false,
    });
    mockUseTvShowVideos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  it('shows centered trailer affordance without mounting the player initially', () => {
    renderWithProviders(
      <DetailHero
        title="Movie Title"
        metadataLine="2020"
        trailer={{ contentType: 'movie', contentId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }}
      />,
    );

    expect(screen.getByLabelText('Play Trailer')).toBeTruthy();
    expect(screen.getByText('Trailer')).toBeTruthy();
    expect(screen.queryByTestId('inline-trailer-player')).toBeNull();
  });

  it('mounts inline player after play tap and closes back to backdrop affordance', () => {
    renderWithProviders(
      <DetailHero
        title="Movie Title"
        metadataLine="2020"
        trailer={{ contentType: 'movie', contentId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }}
      />,
    );

    fireEvent.press(screen.getByLabelText('Play Trailer'));
    expect(screen.getByTestId('inline-trailer-player')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('inline-trailer-player')).toBeNull();
    expect(screen.getByLabelText('Play Trailer')).toBeTruthy();
  });

  it('hides trailer affordance when primary trailer is unavailable', () => {
    mockUseMovieVideos.mockReturnValue({
      data: { primary: null },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(
      <DetailHero
        title="Movie Title"
        metadataLine="2020"
        trailer={{ contentType: 'movie', contentId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }}
      />,
    );

    expect(screen.queryByText('Trailer')).toBeNull();
    expect(screen.queryByTestId('inline-trailer-player')).toBeNull();
  });
});
