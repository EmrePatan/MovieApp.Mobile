import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  type DiscoverHubRailTileSize,
  resolveDiscoverHubRailTileSize,
} from './discover-hub-rail-tile';

export function useDiscoverHubRailTileSize(): DiscoverHubRailTileSize {
  const { width: windowWidth } = useWindowDimensions();
  return useMemo(() => resolveDiscoverHubRailTileSize(windowWidth), [windowWidth]);
}
