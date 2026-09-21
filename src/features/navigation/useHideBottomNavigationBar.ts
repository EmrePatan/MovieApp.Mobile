import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarStyle } from '@/features/navigation/tab-bar-style';

type TabNavigatorLike = {
  getParent: () => TabNavigatorLike | undefined;
  getState?: () => { type?: string } | undefined;
  setOptions: (options: { tabBarStyle?: { display?: 'none' } | ReturnType<typeof getTabBarStyle> }) => void;
};

function findTabNavigator(navigation: TabNavigatorLike): TabNavigatorLike | null {
  let current = navigation.getParent();

  while (current) {
    const state = current.getState?.();
    if (state?.type === 'tab') {
      return current;
    }

    current = current.getParent();
  }

  return null;
}

export function useHideBottomNavigationBar(): void {
  const navigation = useNavigation() as TabNavigatorLike;
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    const tabNavigator = findTabNavigator(navigation);
    if (!tabNavigator) {
      return;
    }

    tabNavigator.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      tabNavigator.setOptions({
        tabBarStyle: getTabBarStyle(insets),
      });
    };
  }, [insets, navigation]);
}
