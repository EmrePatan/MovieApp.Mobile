import { render, screen } from '@testing-library/react-native';
import { SeasonProgressBar } from '@/features/watch-history/components/SeasonProgressBar';
import { colors } from '@/theme/colors';

describe('SeasonProgressBar', () => {
  it('renders a neutral track for not-started seasons', () => {
    render(<SeasonProgressBar watchedEpisodes={0} totalEpisodes={22} />);

    expect(screen.getByTestId('season-progress-bar-fill')).toHaveStyle({
      width: '0%',
      backgroundColor: colors.progressTrack,
    });
  });

  it('renders amber fill for in-progress seasons', () => {
    render(<SeasonProgressBar watchedEpisodes={8} totalEpisodes={22} />);

    expect(screen.getByTestId('season-progress-bar-fill')).toHaveStyle({
      backgroundColor: colors.progressInProgress,
    });
  });

  it('renders emerald fill for completed seasons', () => {
    render(<SeasonProgressBar watchedEpisodes={22} totalEpisodes={22} />);

    expect(screen.getByTestId('season-progress-bar-fill')).toHaveStyle({
      width: '100%',
      backgroundColor: colors.progressCompleted,
    });
  });
});
