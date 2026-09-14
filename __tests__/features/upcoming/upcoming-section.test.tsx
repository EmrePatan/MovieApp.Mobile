import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { UpcomingSection } from '@/features/upcoming/components/UpcomingSection';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';

const upcomingItem = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  type: 'movie' as const,
  title: 'Avatar 4',
  originalTitle: 'Avatar 4',
  overview: 'The next chapter.',
  posterUrl: 'https://example.com/avatar.jpg',
  backdropUrl: null,
  releaseDate: '2026-12-19',
  voteAverage: 0,
  voteCount: 0,
  year: 2026,
  isFollowed: true,
};

const upcomingItemUnfollowed = {
  ...upcomingItem,
  id: '8fa85f64-5717-4562-b3fc-2c963f66afa7',
  title: 'Mission: Impossible 9',
  isFollowed: false,
};

jest.mock('@/features/upcoming/hooks/useUpcomingCatalog', () => ({
  useUpcomingCatalog: jest.fn(),
}));

describe('UpcomingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upcoming items with notified badge when followed', () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [upcomingItem, upcomingItemUnfollowed] }] },
      isLoading: false,
      isError: false,
    });

    render(<UpcomingSection />);

    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Avatar 4')).toBeTruthy();
    expect(screen.getByText('Mission: Impossible 9')).toBeTruthy();
    expect(screen.getByLabelText('Notified')).toBeTruthy();
  });

  it('returns null when there are no upcoming items', () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      isLoading: false,
      isError: false,
    });

    const { toJSON } = render(<UpcomingSection />);
    expect(toJSON()).toBeNull();
  });

  it('calls onItemPress with the tapped item', () => {
    const onItemPress = jest.fn();
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [upcomingItem] }] },
      isLoading: false,
      isError: false,
    });

    render(<UpcomingSection onItemPress={onItemPress} />);
    fireEvent.press(screen.getByRole('button', { name: /Avatar 4/ }));

    expect(onItemPress).toHaveBeenCalledWith(upcomingItem);
  });
});
