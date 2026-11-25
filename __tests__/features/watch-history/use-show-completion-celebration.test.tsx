import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useShowCompletionCelebration } from '@/features/watch-history/hooks/useShowCompletionCelebration';

function CelebrationProbe({
  isCompleted,
  enabled,
  onCompleted,
  forceToken,
}: {
  isCompleted: boolean;
  enabled: boolean;
  onCompleted?: () => void;
  forceToken?: number;
}) {
  const { confettiVisible, dismissConfetti } = useShowCompletionCelebration({
    isCompleted,
    enabled,
    onCompleted,
    forceToken,
  });

  return (
    <>
      <Text testID="confetti-visible">{confettiVisible ? 'yes' : 'no'}</Text>
      <Pressable testID="dismiss-confetti" onPress={dismissConfetti} />
    </>
  );
}

describe('useShowCompletionCelebration', () => {
  it('does not celebrate when progress first loads as already complete', () => {
    const view = render(<CelebrationProbe isCompleted={false} enabled={false} />);

    view.rerender(<CelebrationProbe isCompleted={true} enabled={true} />);

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');
  });

  it('celebrates immediately and defers the completion callback until confetti dismisses', () => {
    const onCompleted = jest.fn();
    const view = render(
      <CelebrationProbe isCompleted={false} enabled={true} onCompleted={onCompleted} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');

    view.rerender(
      <CelebrationProbe isCompleted={true} enabled={true} onCompleted={onCompleted} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('yes');
    expect(onCompleted).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('dismiss-confetti'));
    expect(onCompleted).toHaveBeenCalledTimes(1);

    view.rerender(
      <CelebrationProbe isCompleted={true} enabled={true} onCompleted={onCompleted} />,
    );
    fireEvent.press(screen.getByTestId('dismiss-confetti'));
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it('forces celebration from an explicit token even without a false-to-true edge', () => {
    const onCompleted = jest.fn();
    const view = render(
      <CelebrationProbe isCompleted={true} enabled={true} onCompleted={onCompleted} forceToken={0} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('no');

    view.rerender(
      <CelebrationProbe isCompleted={true} enabled={true} onCompleted={onCompleted} forceToken={1} />,
    );

    expect(screen.getByTestId('confetti-visible').props.children).toBe('yes');
    expect(onCompleted).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('dismiss-confetti'));
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });
});
