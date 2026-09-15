import { render, screen, fireEvent } from '@testing-library/react-native';
import { DiscoveryModeControl } from '@/features/discovery/components/DiscoveryModeControl';

describe('DiscoveryModeControl', () => {
  it('changes discovery browse mode', () => {
    const onChange = jest.fn();
    render(<DiscoveryModeControl value="trending" onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Top Rated'));
    expect(onChange).toHaveBeenCalledWith('top_rated');
  });
});
