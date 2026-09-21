import { useEffect, type ReactElement, type ReactNode } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import {
  DISCOVER_CHROME_STAGE_DEFINITIONS,
  type DiscoverChromeProbeStage,
} from './discover-chrome-delta';
import { logRouteScreenMount, useRouteScreenProbe } from './route-screen-probe';
import { logNavigationDiagnostic } from './navigation-diagnostics';
import { commonStyles } from '@/theme/theme';

/** When true, DEV Android uses chrome ladder instead of route probe stages 0–4. */
export const DISCOVER_USE_CHROME_PROBE = true;

/** One-line switch for chrome isolation on DEV Android. First device test: 4A. */
export const DISCOVER_CHROME_PROBE_STAGE: DiscoverChromeProbeStage = '4A';

interface DiscoverChromeProbeProps {
  stage: DiscoverChromeProbeStage;
  items: SearchResultItem[];
  onPress: (item: SearchResultItem) => void;
  headerShell: ReactElement;
  headerWithTitle: ReactElement;
  headerFull: ReactElement;
  listEmptyComponent: ReactElement | null;
  listFooter: ReactElement | null;
  contentContainerStyle: StyleProp<ViewStyle>;
  emptyContentContainerStyle: StyleProp<ViewStyle>;
  refreshControl: ReactElement<RefreshControlProps> | undefined;
  onEndReached: () => void;
  initialNumToRender: number;
  maxToRenderPerBatch: number;
  windowSize: number;
  productionScreen: ReactNode;
}

function resolveListHeader(
  stage: DiscoverChromeProbeStage,
  headerShell: ReactElement,
  headerWithTitle: ReactElement,
  headerFull: ReactElement,
): ReactElement | undefined {
  if (stage === '4A') {
    return headerShell;
  }

  if (stage === '4B') {
    return headerWithTitle;
  }

  if (stage === '4C' || stage === '4D') {
    return headerFull;
  }

  return undefined;
}

export function DiscoverChromeProbe({
  stage,
  items,
  onPress,
  headerShell,
  headerWithTitle,
  headerFull,
  listEmptyComponent,
  listFooter,
  contentContainerStyle,
  emptyContentContainerStyle,
  refreshControl,
  onEndReached,
  initialNumToRender,
  maxToRenderPerBatch,
  windowSize,
  productionScreen,
}: DiscoverChromeProbeProps) {
  const { pathname, segments, onRootLayout } = useRouteScreenProbe('discover-browse-chrome', {
    chromeStage: stage,
  });
  const stageMeta = DISCOVER_CHROME_STAGE_DEFINITIONS[stage];

  useEffect(() => {
    logRouteScreenMount('discover-browse-chrome', {
      chromeStage: stage,
      label: stageMeta.label,
      newDelta: stageMeta.newDelta,
      pathname,
      segments,
      itemCount: items.length,
    });
  }, [items.length, pathname, segments, stage, stageMeta.label, stageMeta.newDelta]);

  useEffect(() => {
    logNavigationDiagnostic('discover-chrome-probe:render', {
      chromeStage: stage,
      label: stageMeta.label,
      pathname,
      itemCount: items.length,
    });
  });

  if (stage === '4E') {
    return productionScreen;
  }

  const listHeaderComponent = resolveListHeader(stage, headerShell, headerWithTitle, headerFull);
  const useProductionRoot = stage === '4D';
  const useProductionFlatListProps = stage === '4D';

  return (
    <View
      testID={`discover-chrome-probe-${stage.toLowerCase()}`}
      style={useProductionRoot ? commonStyles.screen : styles.probeRoot}
      collapsable={false}
      onLayout={onRootLayout}
    >
      <Text style={styles.probeLabel}>{stageMeta.label}</Text>
      <FlatList
        testID={useProductionFlatListProps ? 'discover-browse-list' : 'discover-route-probe-list'}
        style={useProductionFlatListProps ? undefined : styles.probeList}
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={({ item }) => <SearchResultCard item={item} onPress={onPress} />}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={useProductionFlatListProps ? listEmptyComponent : undefined}
        ListFooterComponent={useProductionFlatListProps ? listFooter : undefined}
        contentContainerStyle={
          useProductionFlatListProps
            ? items.length === 0
              ? emptyContentContainerStyle
              : contentContainerStyle
            : styles.listContent
        }
        refreshControl={useProductionFlatListProps ? refreshControl : undefined}
        onEndReached={useProductionFlatListProps ? onEndReached : undefined}
        onEndReachedThreshold={useProductionFlatListProps ? 0.4 : undefined}
        showsVerticalScrollIndicator={useProductionFlatListProps ? false : undefined}
        keyboardShouldPersistTaps={useProductionFlatListProps ? 'handled' : undefined}
        initialNumToRender={useProductionFlatListProps ? initialNumToRender : undefined}
        maxToRenderPerBatch={useProductionFlatListProps ? maxToRenderPerBatch : undefined}
        windowSize={useProductionFlatListProps ? windowSize : undefined}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          logNavigationDiagnostic(`discover-chrome-probe:${stage}:flatlist-layout`, {
            pathname,
            itemCount: items.length,
            x,
            y,
            width,
            height,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  probeRoot: {
    flex: 1,
    backgroundColor: '#1A0033',
  },
  probeList: {
    flex: 1,
  },
  probeLabel: {
    color: '#00FFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#330066',
  },
  listContent: {
    paddingBottom: 32,
  },
});
