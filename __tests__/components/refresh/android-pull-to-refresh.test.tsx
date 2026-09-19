import { render, screen } from '@testing-library/react-native';
import { AndroidPullToRefreshHeader } from '@/components/refresh/AndroidPullToRefreshHeader';
import { useSharedValue } from 'react-native-reanimated';

describe('AndroidPullToRefreshHeader', () => {
  it('renders the Android pull refresh indicator while refreshing', () => {
    const pullDistance = useSharedValue(0);

    render(
      <AndroidPullToRefreshHeader pullDistance={pullDistance} refreshing={true} />,
    );

    expect(screen.getByTestId('android-pull-refresh-header')).toBeTruthy();
    expect(screen.getByTestId('android-pull-refresh-indicator')).toBeTruthy();
  });
});
