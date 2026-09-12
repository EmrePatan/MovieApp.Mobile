import { render, screen, fireEvent } from '@testing-library/react-native';
import { DiscoveryKindControl } from '@/features/discovery/components/DiscoveryKindControl';

describe('DiscoveryKindControl', () => {
  it('changes discovery kind', () => {
    const onChange = jest.fn();
    render(<DiscoveryKindControl value="trending" onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Popular'));
    expect(onChange).toHaveBeenCalledWith('popular');
  });
});
