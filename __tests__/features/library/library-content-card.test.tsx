import { fireEvent, render, screen } from '@testing-library/react-native';
import { LibraryContentCard } from '@/features/library/components/LibraryContentCard';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';

const movieItem: LibraryItem = {
  id: 'movie-id',
  type: 'movie',
  title: 'Interstellar',
  posterPath: null,
  airDate: '2014-11-07',
  voteAverage: 8.4,
  createdAt: '2026-09-11T14:30:00Z',
};

describe('LibraryContentCard', () => {
  it('renders movie card and navigates on press', () => {
    const onPress = jest.fn();
    render(<LibraryContentCard item={movieItem} onPress={onPress} />);

    fireEvent.press(screen.getByLabelText('Interstellar, Movie, 2014, rating 8.4'));
    expect(onPress).toHaveBeenCalledWith(movieItem);
  });

  it('removes item when remove button is pressed', () => {
    const onRemove = jest.fn();
    render(
      <LibraryContentCard
        item={movieItem}
        removeIcon="bookmark"
        onRemove={onRemove}
      />,
    );

    fireEvent.press(screen.getByLabelText('Remove Interstellar from watchlist'));
    expect(onRemove).toHaveBeenCalledWith(movieItem);
  });

  it('uses heart remove label for favorites', () => {
    const onRemove = jest.fn();
    render(
      <LibraryContentCard
        item={movieItem}
        removeIcon="heart"
        removeAccessibilityLabel="favorites"
        onRemove={onRemove}
      />,
    );

    fireEvent.press(screen.getByLabelText('Remove Interstellar from favorites'));
    expect(onRemove).toHaveBeenCalledWith(movieItem);
  });

  it('renders tv badge', () => {
    const tvItem: LibraryItem = {
      ...movieItem,
      id: 'tv-id',
      type: 'tv',
      title: 'Breaking Bad',
      airDate: '2008-01-20',
    };

    render(<LibraryContentCard item={tvItem} />);
    expect(screen.getByText('TV')).toBeTruthy();
  });

  it('truncates long titles with numberOfLines', () => {
    const longTitleItem: LibraryItem = {
      ...movieItem,
      title: 'An Extremely Long Movie Title That Should Be Truncated In The UI Layout',
    };

    render(<LibraryContentCard item={longTitleItem} />);
    expect(
      screen.getByText(
        'An Extremely Long Movie Title That Should Be Truncated In The UI Layout',
      ),
    ).toBeTruthy();
  });
});
