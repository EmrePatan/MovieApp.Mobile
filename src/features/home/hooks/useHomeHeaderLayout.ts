import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { getHomeHeaderLayout } from '../utils/home-header-layout';

export function useHomeHeaderLayout() {
  const { width } = useWindowDimensions();

  return useMemo(() => getHomeHeaderLayout(width), [width]);
}
