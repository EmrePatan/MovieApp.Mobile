import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { PrimaryTabBar } from '@/features/navigation/PrimaryTabBar';
import { BASE_TAB_BAR_HEIGHT } from '@/features/navigation/tab-bar-style';
import { initI18nForTests } from '../../i18n/i18n-test-utils';

const mockInsets = { top: 44, bottom: 34, left: 0, right: 0 };

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), dismissAll: jest.fn(), dismissTo: jest.fn() }),
  usePathname: () => '/home',
  useSegments: () => ['(tabs)', '(app-shell)', 'home'],
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets,
}));

describe('PrimaryTabBar layout', () => {
  beforeAll(async () => {
    await initI18nForTests('tr');
  });

  it('renders Turkish home and insights labels', () => {
    render(<PrimaryTabBar />);

    expect(screen.getByText('Ana Sayfa')).toBeTruthy();
    expect(screen.getByText('İstatistikler')).toBeTruthy();
  });

  it('reports rendered height through the tab bar height callback context', () => {
    const onHeightChange = jest.fn();

    const { BottomTabBarHeightCallbackContext } = require('expo-router/build/react-navigation/bottom-tabs/utils/BottomTabBarHeightCallbackContext');

    const { UNSAFE_getAllByType } = render(
      <BottomTabBarHeightCallbackContext.Provider value={onHeightChange}>
        <PrimaryTabBar />
      </BottomTabBarHeightCallbackContext.Provider>,
    );

    const tabBarContainer = UNSAFE_getAllByType(View).find((node) => node.props.onLayout);
    expect(tabBarContainer).toBeTruthy();

    fireEvent(tabBarContainer!, 'layout', {
      nativeEvent: { layout: { height: BASE_TAB_BAR_HEIGHT + mockInsets.bottom, width: 390 } },
    });

    expect(onHeightChange).toHaveBeenCalled();
    const reportedHeight = onHeightChange.mock.calls.at(-1)?.[0] as number;
    expect(reportedHeight).toBeGreaterThanOrEqual(BASE_TAB_BAR_HEIGHT + mockInsets.bottom);
  });
});
