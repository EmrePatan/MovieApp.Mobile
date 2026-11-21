import { fireEvent, render, screen } from '@testing-library/react-native';
import { PosterWatchedBadge } from '@/features/browse-quick-actions/components/PosterWatchedBadge';

describe('PosterWatchedBadge', () => {
  it('renders nothing when not watched and not interactive', () => {
    render(<PosterWatchedBadge watched={false} />);
    expect(screen.queryByTestId('poster-watched-badge')).toBeNull();
  });

  it('renders a quiet corner mark when watched and not interactive', () => {
    render(<PosterWatchedBadge watched />);
    expect(screen.getByTestId('poster-watched-badge')).toBeTruthy();
  });

  it('shows an idle check control that toggles watched on press', () => {
    const onPress = jest.fn();
    render(<PosterWatchedBadge watched={false} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('poster-watched-badge'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes selected state when already watched', () => {
    render(<PosterWatchedBadge watched onPress={jest.fn()} />);
    expect(screen.getByTestId('poster-watched-badge').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
