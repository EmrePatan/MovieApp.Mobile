import { render, screen } from '@testing-library/react-native';
import { Animated, Dimensions } from 'react-native';
import { ShowCompletedConfettiOverlay } from '@/features/watch-history/components/ShowCompletedConfettiOverlay';

describe('ShowCompletedConfettiOverlay', () => {
  beforeEach(() => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 400,
      height: 800,
      scale: 2,
      fontScale: 2,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('positions particles with pixel offsets for release-safe layout', () => {
    const timingSpy = jest.spyOn(Animated, 'timing').mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    }));

    render(<ShowCompletedConfettiOverlay visible onDismiss={jest.fn()} />);

    const particle = screen.getByTestId('show-completed-confetti-particle-0');
    expect(particle.props.style).toMatchObject({
      left: 6,
      position: 'absolute',
    });
    expect(timingSpy).toHaveBeenCalled();
  });
});
