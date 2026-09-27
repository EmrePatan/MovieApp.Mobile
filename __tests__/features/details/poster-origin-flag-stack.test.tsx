import { render, screen } from '@testing-library/react-native';
import { PosterOriginFlagStack } from '@/features/details/shared/components/PosterOriginFlagStack';

describe('PosterOriginFlagStack', () => {
  it('renders up to two stacked flag badges', () => {
    render(<PosterOriginFlagStack countryCodes={['TR', 'US', 'FR']} />);

    const stack = screen.getByTestId('poster-origin-flag-stack');
    expect(stack.children).toHaveLength(2);
    expect(stack.props.accessibilityLabel?.split(',')).toHaveLength(2);
  });

  it('renders nothing when codes are empty', () => {
    render(<PosterOriginFlagStack countryCodes={[]} />);
    expect(screen.queryByTestId('poster-origin-flag-stack')).toBeNull();
  });
});
