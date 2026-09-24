import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';

function CelebrationProbe({ isCompleted, enabled }: { isCompleted: boolean; enabled: boolean }) {
  const { confettiVisible } = useShowCompletionCelebration({ isCompleted, enabled });

  return <Text testID="confetti-visible">{confettiVisible ? 'yes' : 'no'}</Text>;
}

describe('useShowCompletionCelebration', () => {
  it('does not celebrate when progress first loads as already complete', () => {
    const view = render(<CelebrationProbe isCompleted={false} enabled={false} />);

    view.rerender(<CelebrationProbe isCompleted={true} enabled={true} />);

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');
  });

  it('celebrates only when completion crosses from false to true', () => {
    const view = render(<CelebrationProbe isCompleted={false} enabled={true} />);

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');

    view.rerender(<CelebrationProbe isCompleted={true} enabled={true} />);

    expect(screen.getByTestId('confetti-visible').props.children).toBe('yes');
  });
});
