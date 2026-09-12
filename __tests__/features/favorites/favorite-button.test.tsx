import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useFavoriteStatus } from '@/features/favorites/hooks/useFavoriteStatus';
import { useToggleFavorite } from '@/features/favorites/hooks/useFavoriteMutations';

const mockPush = jest.fn();
const mockMutate = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/favorites/hooks/useFavoriteStatus', () => ({
  useFavoriteStatus: jest.fn(),
}));

jest.mock('@/features/favorites/hooks/useFavoriteMutations', () => ({
  useToggleFavorite: jest.fn(),
}));

describe('FavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
    (useFavoriteStatus as jest.Mock).mockReturnValue({
      data: false,
      isLoading: false,
    });
    (useToggleFavorite as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders inactive favorite state', () => {
    render(<FavoriteButton contentType="movie" contentId="movie-id" />);
    expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
  });

  it('renders active favorite state', () => {
    (useFavoriteStatus as jest.Mock).mockReturnValue({
      data: true,
      isLoading: false,
    });

    render(<FavoriteButton contentType="tv" contentId="tv-id" />);
    expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
  });

  it('submits favorite mutation on press', () => {
    render(<FavoriteButton contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByLabelText('Add to favorites'));
    expect(mockMutate).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('shows loading state while mutation is pending', () => {
    (useToggleFavorite as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<FavoriteButton contentType="movie" contentId="movie-id" />);
    expect(screen.getByLabelText('Add to favorites').props.accessibilityState.disabled).toBe(true);
  });

  it('prompts login when unauthenticated', () => {
    mockRequireAuth.mockReturnValue(false);

    render(<FavoriteButton contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByLabelText('Add to favorites'));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to use favorites.')).toBeTruthy();
  });
});
