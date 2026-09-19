jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

import { render, screen } from '@testing-library/react-native';
import { BrandedStartupSplash } from '@/bootstrap/BrandedStartupSplash';

describe('BrandedStartupSplash', () => {
  it('renders the approved Movie Cave splash artwork full screen', () => {
    render(<BrandedStartupSplash />);

    const splash = screen.getByTestId('branded-startup-splash');
    expect(splash).toBeTruthy();
    expect(splash.props.style).toMatchObject({ flex: 1, backgroundColor: '#0A0A0F' });
  });
});
