import React from 'react';
import { Alert, Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PlayTrailerButton } from '@/features/details/videos/components/PlayTrailerButton';
import { useMovieVideos, useTvShowVideos } from '@/features/details/videos/hooks/useVideos';

const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();

jest.mock('expo-linking', () => ({
  canOpenURL: (...args: unknown[]) => mockCanOpenURL(...args),
  openURL: (...args: unknown[]) => mockOpenURL(...args),
}));

jest.mock('@/features/details/videos/hooks/useVideos', () => ({
  useMovieVideos: jest.fn(),
  useTvShowVideos: jest.fn(),
}));

const mockUseMovieVideos = useMovieVideos as jest.Mock;
const mockUseTvShowVideos = useTvShowVideos as jest.Mock;

const validWatchUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('PlayTrailerButton', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
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
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockResolvedValue(true);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('renders for movie when primary trailer is available', () => {
    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    expect(screen.getByLabelText('Play Trailer')).toBeTruthy();
    expect(screen.getByText('Trailer')).toBeTruthy();
  });

  it('renders for tv when primary trailer is available', () => {
    mockUseMovieVideos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
    mockUseTvShowVideos.mockReturnValue({
      data: { primary: { watchUrl: validWatchUrl } },
      isLoading: false,
      isError: false,
    });

    render(<PlayTrailerButton contentType="tv" contentId="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" />);

    expect(screen.getByText('Trailer')).toBeTruthy();
  });

  it('hides when primary is null', () => {
    mockUseMovieVideos.mockReturnValue({
      data: { primary: null },
      isLoading: false,
      isError: false,
    });

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    expect(screen.queryByText('Trailer')).toBeNull();
  });

  it('hides while loading', () => {
    mockUseMovieVideos.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    expect(screen.queryByText('Trailer')).toBeNull();
  });

  it('hides on query error', () => {
    mockUseMovieVideos.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    expect(screen.queryByText('Trailer')).toBeNull();
  });

  it('opens valid canonical YouTube URLs through Linking on iOS', async () => {
    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    fireEvent.press(screen.getByLabelText('Play Trailer'));

    await waitFor(() => {
      expect(mockCanOpenURL).toHaveBeenCalledWith(validWatchUrl);
      expect(mockOpenURL).toHaveBeenCalledWith(validWatchUrl);
    });
  });

  it('opens valid canonical YouTube URLs on Android without canOpenURL preflight', async () => {
    Platform.OS = 'android';

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    fireEvent.press(screen.getByLabelText('Play Trailer'));

    await waitFor(() => {
      expect(mockCanOpenURL).not.toHaveBeenCalled();
      expect(mockOpenURL).toHaveBeenCalledWith(validWatchUrl);
    });
  });

  it('shows feedback on iOS when Linking.canOpenURL returns false', async () => {
    mockCanOpenURL.mockResolvedValueOnce(false);

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);
    fireEvent.press(screen.getByLabelText('Play Trailer'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Unable to open trailer', 'Please try again later.');
    });
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('opens trailer on Android even when canOpenURL would return false', async () => {
    Platform.OS = 'android';
    mockCanOpenURL.mockResolvedValueOnce(false);

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);
    fireEvent.press(screen.getByLabelText('Play Trailer'));

    await waitFor(() => {
      expect(mockCanOpenURL).not.toHaveBeenCalled();
      expect(mockOpenURL).toHaveBeenCalledWith(validWatchUrl);
    });
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('does not open invalid URLs', async () => {
    mockUseMovieVideos.mockReturnValue({
      data: { primary: { watchUrl: 'https://evil.example/watch?v=abc' } },
      isLoading: false,
      isError: false,
    });

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);

    expect(screen.queryByText('Trailer')).toBeNull();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('shows feedback when Linking.openURL fails on iOS', async () => {
    mockOpenURL.mockRejectedValueOnce(new Error('failed'));

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);
    fireEvent.press(screen.getByLabelText('Play Trailer'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Unable to open trailer', 'Please try again later.');
    });
  });

  it('shows feedback when Linking.openURL fails on Android', async () => {
    Platform.OS = 'android';
    mockOpenURL.mockRejectedValueOnce(new Error('failed'));

    render(<PlayTrailerButton contentType="movie" contentId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" />);
    fireEvent.press(screen.getByLabelText('Play Trailer'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Unable to open trailer', 'Please try again later.');
    });
    expect(mockCanOpenURL).not.toHaveBeenCalled();
  });
});
