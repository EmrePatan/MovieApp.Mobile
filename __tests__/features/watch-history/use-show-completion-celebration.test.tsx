import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';

function CelebrationProbe({
  isCompleted,
  enabled,
  onCompleted,
}: {
  isCompleted: boolean;
  enabled: boolean;
  onCompleted?: () => void;
}) {
  const { confettiVisible } = useShowCompletionCelebration({ isCompleted, enabled, onCompleted });

  return <Text testID="confetti-visible">{confettiVisible ? 'yes' : 'no'}</Text>;
}

describe('useShowCompletionCelebration', () => {
  it('does not celebrate when progress first loads as already complete', () => {
    const view = render(<CelebrationProbe isCompleted={false} enabled={false} />);

    view.rerender(<CelebrationProbe isCompleted={true} enabled={true} />);

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');
  });

  it('celebrates and invokes the completion callback exactly once on a false-to-true transition', () => {
    const onCompleted = jest.fn();
    const view = render(
      <CelebrationProbe isCompleted={false} enabled={true} onCompleted={onCompleted} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');

    view.rerender(
      <CelebrationProbe isCompleted={true} enabled={true} onCompleted={onCompleted} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('yes');
    expect(onCompleted).toHaveBeenCalledTimes(1);

    view.rerender(
      <CelebrationProbe isCompleted={true} enabled={true} onCompleted={onCompleted} />,
    );
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });
});
