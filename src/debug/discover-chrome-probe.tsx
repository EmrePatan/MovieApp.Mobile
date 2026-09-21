import { useCallback, useEffect, useRef, type ReactElement, type ReactNode } from 'react';
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
  isDiscoverChromeStageAtLeast,
  type DiscoverChromeProbeStage,
} from './discover-chrome-delta';
import { useRouteScreenProbe } from './route-screen-probe';
import { logNavigationDiagnostic } from './navigation-diagnostics';
import { commonStyles } from '@/theme/theme';

/** When true, DEV Android uses chrome ladder instead of route probe stages 0–4. */
export const DISCOVER_USE_CHROME_PROBE = true;

/** One-line switch for chrome isolation on DEV Android. First 4D sub-stage test: 4D1. */
export const DISCOVER_CHROME_PROBE_STAGE: DiscoverChromeProbeStage = '4D1';

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
  refreshing: boolean;
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

  if (isDiscoverChromeStageAtLeast(stage, '4C')) {
    return headerFull;
  }

  return undefined;
}

function flattenStyleForLog(style: StyleProp<ViewStyle>) {
  const flattened = StyleSheet.flatten(style);
  return flattened ?? {};
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
  refreshing,
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
  const index0LoggedRef = useRef(false);
  const contentBranchLoggedRef = useRef(false);

  useEffect(() => {
    index0LoggedRef.current = false;
    contentBranchLoggedRef.current = false;
  }, [stage]);

  const useProductionRoot = isDiscoverChromeStageAtLeast(stage, '4D1');
  const useProductionFlatListStyle = isDiscoverChromeStageAtLeast(stage, '4D2');
  const useProductionContentContainerStyle = isDiscoverChromeStageAtLeast(stage, '4D3');
  const useListEmptyComponent = isDiscoverChromeStageAtLeast(stage, '4D4');
  const useListFooterComponent = isDiscoverChromeStageAtLeast(stage, '4D5');
  const useRefreshControl = isDiscoverChromeStageAtLeast(stage, '4D6');
  const useOnEndReached = isDiscoverChromeStageAtLeast(stage, '4D7');
  const useFlatListTuning = isDiscoverChromeStageAtLeast(stage, '4D8');

  const contentContainerBranch = items.length === 0 ? 'emptyListContent' : 'listContent';
  const resolvedContentContainerStyle = useProductionContentContainerStyle
    ? items.length === 0
      ? emptyContentContainerStyle
      : contentContainerStyle
    : styles.listContent;

  useEffect(() => {
    logNavigationDiagnostic('discover-chrome-probe:mount', {
      chromeStage: stage,
      label: stageMeta.label,
      newDelta: stageMeta.newDelta,
      pathname,
      segments,
      itemCount: items.length,
    });
  }, [items.length, pathname, segments, stage, stageMeta.label, stageMeta.newDelta]);

  useEffect(() => {
    if (!useProductionContentContainerStyle) {
      contentBranchLoggedRef.current = false;
      return;
    }

    if (contentBranchLoggedRef.current) {
      return;
    }

    contentBranchLoggedRef.current = true;
    logNavigationDiagnostic('discover-chrome-probe:content-container-style', {
      chromeStage: stage,
      itemCount: items.length,
      branch: contentContainerBranch,
      flexGrowSelected: contentContainerBranch === 'emptyListContent',
      resolvedStyle: flattenStyleForLog(resolvedContentContainerStyle),
    });
  }, [
    contentContainerBranch,
    items.length,
    resolvedContentContainerStyle,
    stage,
    useProductionContentContainerStyle,
  ]);

  useEffect(() => {
    if (!useRefreshControl) {
      return;
    }

    logNavigationDiagnostic('discover-chrome-probe:refresh-state', {
      chromeStage: stage,
      refreshing,
      itemCount: items.length,
    });
  }, [items.length, refreshing, stage, useRefreshControl]);

  const handleEndReached = useCallback(() => {
    logNavigationDiagnostic('discover-chrome-probe:on-end-reached', {
      chromeStage: stage,
      itemCount: items.length,
    });
    onEndReached();
  }, [items.length, onEndReached, stage]);

  const renderItem = useCallback(
    ({ item, index }: { item: SearchResultItem; index: number }) => {
      if (index === 0 && !index0LoggedRef.current) {
        index0LoggedRef.current = true;
        logNavigationDiagnostic('discover-chrome-probe:render-item-index0', {
          chromeStage: stage,
          itemCount: items.length,
          id: item.id,
          type: item.type,
          title: item.title,
        });
      }

      const card = <SearchResultCard item={item} onPress={onPress} />;

      if (index !== 0) {
        return card;
      }

      return (
        <View
          collapsable={false}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            logNavigationDiagnostic('discover-chrome-probe:row-index0-layout', {
              chromeStage: stage,
              itemCount: items.length,
              x,
              y,
              width,
              height,
            });
          }}
        >
          {card}
        </View>
      );
    },
    [items.length, onPress, stage],
  );

  const listTestId = useFlatListTuning ? 'discover-browse-list' : 'discover-route-probe-list';

  if (stage === '4E') {
    return productionScreen;
  }

  const listHeaderComponent = resolveListHeader(stage, headerShell, headerWithTitle, headerFull);

  return (
    <View
      testID={`discover-chrome-probe-${stage.toLowerCase()}`}
      style={useProductionRoot ? commonStyles.screen : styles.probeRoot}
      collapsable={false}
      onLayout={onRootLayout}
    >
      <Text style={styles.probeLabel}>{stageMeta.label}</Text>
      <FlatList
        testID={listTestId}
        style={useProductionFlatListStyle ? undefined : styles.probeList}
        data={items}
        keyExtractor={searchResultKeyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={useListEmptyComponent ? listEmptyComponent : undefined}
        ListFooterComponent={useListFooterComponent ? listFooter : undefined}
        contentContainerStyle={resolvedContentContainerStyle}
        refreshControl={useRefreshControl ? refreshControl : undefined}
        onEndReached={useOnEndReached ? handleEndReached : undefined}
        onEndReachedThreshold={useOnEndReached ? 0.4 : undefined}
        showsVerticalScrollIndicator={useFlatListTuning ? false : undefined}
        keyboardShouldPersistTaps={useFlatListTuning ? 'handled' : undefined}
        initialNumToRender={useFlatListTuning ? initialNumToRender : undefined}
        maxToRenderPerBatch={useFlatListTuning ? maxToRenderPerBatch : undefined}
        windowSize={useFlatListTuning ? windowSize : undefined}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          logNavigationDiagnostic('discover-chrome-probe:flatlist-layout', {
            chromeStage: stage,
            pathname,
            itemCount: items.length,
            x,
            y,
            width,
            height,
          });
        }}
        onContentSizeChange={(width, height) => {
          logNavigationDiagnostic('discover-chrome-probe:content-size', {
            chromeStage: stage,
            itemCount: items.length,
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
