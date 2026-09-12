import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { useHome } from '@/features/home/hooks/useHome';
import HomeScreen from '../../../app/(tabs)/home';

const mockRefetch = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockUseHome = useHome as jest.Mock;

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('@/features/home/hooks/useHome', () => ({
  homeQueryKey: (type: string, sectionSize: number) => ['home', type, sectionSize],
  useHome: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseHome.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByLabelText('Loading home')).toBeTruthy();
  });

  it('renders home sections on success', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Popular',
            title: 'Popular',
            displayOrder: 1,
            items: [
              {
                id: 'abc',
                contentType: 'tv',
                title: 'Breaking Bad',
                originalTitle: 'Breaking Bad',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2008-01-20',
                voteAverage: 8.9,
                voteCount: 100,
              },
            ],
          },
        ],
        isPersonalized: false,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByText('Popular')).toBeTruthy();
    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('TV')).toBeTruthy();
  });

  it('renders error state with retry', () => {
    mockUseHome.mockReturnValue({
      data: undefined,
      error: new ApiError({ kind: 'network' }),
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('requests a new type when filter changes', () => {
    mockUseHome.mockReturnValue({
      data: { sections: [], isPersonalized: false },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Show TV Shows'));

    expect(mockUseHome).toHaveBeenLastCalledWith('tv', 10);
  });
});
