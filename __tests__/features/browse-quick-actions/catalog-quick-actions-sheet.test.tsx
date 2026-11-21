import { fireEvent, render, screen } from '@testing-library/react-native';
import { CatalogQuickActionsSheet } from '@/features/browse-quick-actions/components/CatalogQuickActionsSheet';

const target = {
  contentId: 'movie-1',
  contentType: 'movie' as const,
  title: 'Interstellar',
  posterUrl: '/poster.jpg',
  year: 2014,
  voteAverage: 8.6,
};

describe('CatalogQuickActionsSheet', () => {
  it('renders the redesign layout with primary and secondary actions', () => {
    const onToggleWatched = jest.fn();
    const onToggleFavorite = jest.fn();
    const onOpenWatchlists = jest.fn();

    render(
      <CatalogQuickActionsSheet
        visible
        target={target}
        isWatched={false}
        isFavorited={false}
        onClose={jest.fn()}
        onToggleWatched={onToggleWatched}
        onToggleFavorite={onToggleFavorite}
        onOpenWatchlists={onOpenWatchlists}
      />,
    );

    expect(screen.getByTestId('catalog-quick-actions-sheet')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByText('2014')).toBeTruthy();
    expect(screen.getByText('8.6')).toBeTruthy();
    expect(screen.queryByText('Track your viewing history')).toBeNull();

    fireEvent.press(screen.getByTestId('quick-action-watched'));
    fireEvent.press(screen.getByTestId('quick-action-favorite'));
    fireEvent.press(screen.getByTestId('quick-action-watchlist'));

    expect(onToggleWatched).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onOpenWatchlists).toHaveBeenCalledTimes(1);
  });

  it('reflects watched and favorited states without changing callbacks', () => {
    render(
      <CatalogQuickActionsSheet
        visible
        target={target}
        isWatched
        isFavorited
        onClose={jest.fn()}
        onToggleWatched={jest.fn()}
        onToggleFavorite={jest.fn()}
        onOpenWatchlists={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Mark as unwatched')).toBeTruthy();
    expect(screen.getByTestId('quick-action-favorite').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
