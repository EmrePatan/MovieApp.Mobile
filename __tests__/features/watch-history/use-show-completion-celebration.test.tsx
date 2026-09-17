import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';

function CelebrationProbe({
  watchedEpisodes,
  totalEpisodes,
  enabled,
}: {
  watchedEpisodes: number;
  totalEpisodes: number;
  enabled: boolean;
}) {
  const { confettiVisible } = useShowCompletionCelebration({
    watchedEpisodes,
    totalEpisodes,
    enabled,
  });

  return <Text testID="confetti-visible">{confettiVisible ? 'yes' : 'no'}</Text>;
}

describe('useShowCompletionCelebration', () => {
  it('does not celebrate when progress first loads as already complete', () => {
    const view = render(
      <CelebrationProbe watchedEpisodes={0} totalEpisodes={0} enabled={false} />,
    );

    view.rerender(
      <CelebrationProbe watchedEpisodes={35} totalEpisodes={35} enabled={true} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');
  });

  it('celebrates only when progress crosses from incomplete to complete', () => {
    const view = render(
      <CelebrationProbe watchedEpisodes={34} totalEpisodes={35} enabled={true} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');

    view.rerender(
      <CelebrationProbe watchedEpisodes={35} totalEpisodes={35} enabled={true} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('yes');
  });
});
