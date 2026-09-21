/**
 * #45 device-proven Stage 4 vs production discover-browse delta inventory.
 */

export const DISCOVER_STAGE4_TREE = [
  'View probeRoot (flex:1, dark diagnostic background)',
  'Text DISCOVER CONTROL 4',
  'FlatList (style flex:1, testID discover-route-probe-list)',
  '  data = real items',
  '  keyExtractor = searchResultKeyExtractor',
  '  renderItem = SearchResultCard (+ index0 diagnostic wrappers)',
  '  contentContainerStyle = paddingBottom only',
  '  NO ListHeaderComponent',
  '  NO ListEmptyComponent',
  '  NO ListFooterComponent',
  '  NO refreshControl',
  '  NO onEndReached',
  '  NO outer commonStyles.screen wrapper',
  '  NO DiscoverFilterSheet overlay',
];

export const DISCOVER_PRODUCTION_TREE = [
  'View commonStyles.screen (flex:1, colors.background)',
  'FlatList (testID discover-browse-list, NO style flex:1)',
  '  ListHeaderComponent = View > SafeAreaView > DetailBackButton + title + filters + ActiveFilterChips',
  '  ListEmptyComponent = loading | error | empty branches',
  '  ListFooterComponent = pagination ActivityIndicator',
  '  contentContainerStyle = listContent OR emptyListContent (flexGrow:1 when empty)',
  '  refreshControl = MovieAppRefreshControl',
  '  onEndReached + onEndReachedThreshold',
  '  showsVerticalScrollIndicator=false',
  '  keyboardShouldPersistTaps=handled',
  '  initialNumToRender / maxToRenderPerBatch / windowSize',
  'DiscoverFilterSheet sibling overlay when filterSheetVisible',
];

export const DISCOVER_STAGE4_TO_PRODUCTION_DELTA = [
  'Outer root: probeRoot → commonStyles.screen',
  'FlatList style: flex:1 → undefined',
  'ListHeaderComponent: none → SafeAreaView header chrome',
  'ListEmptyComponent: none → conditional loading/error/empty',
  'ListFooterComponent: none → pagination spinner',
  'contentContainerStyle: fixed padding → conditional flexGrow when empty',
  'refreshControl: none → MovieAppRefreshControl',
  'onEndReached: none → pagination handler',
  'FlatList virtualization props: none → layout.verticalList tuning',
  'DiscoverFilterSheet overlay: none → modal when visible',
];

/** Device-proven refresh boundary: 4D5 PASS, 4D6 (MovieAppRefreshControl) FAIL on Android. */
export const DISCOVER_4D5_TO_4D6_DELTA = [
  'refreshControl: none → MovieAppRefreshControl on FlatList',
];

/** Controlled confirmation ladder for refresh root-cause isolation (re-enable chrome probe). */
export const DISCOVER_REFRESH_CONFIRMATION_LADDER = {
  R1: '4D5 + bare React Native RefreshControl (refreshing=false, noop onRefresh)',
  R2: 'R1 + production refreshing/onRefresh values',
  R3: 'R2 + MovieAppRefreshControl styling/props one group at a time',
};

/** Device-proven failure boundary: bundled 4C→4D delta introduced on Android v15-chrome. */
export const DISCOVER_OLD_4C_TO_4D_DELTA = [
  'Outer root: probeRoot → commonStyles.screen',
  'FlatList style: flex:1 → undefined (production: no explicit style)',
  'contentContainerStyle: fixed probe padding → conditional listContent | emptyListContent',
  'ListEmptyComponent: none → conditional loading/error/empty',
  'ListFooterComponent: none → pagination ActivityIndicator',
  'refreshControl: none → MovieAppRefreshControl',
  'onEndReached + onEndReachedThreshold: none → production pagination handler',
  'FlatList tuning: none → showsVerticalScrollIndicator, keyboardShouldPersistTaps, virtualization props',
  'FlatList testID: discover-route-probe-list → discover-browse-list',
];

export type DiscoverChromeProbeStage =
  | '4A'
  | '4B'
  | '4C'
  | '4D1'
  | '4D2'
  | '4D3'
  | '4D4'
  | '4D5'
  | '4D6'
  | '4D7'
  | '4D8'
  | '4E';

export const DISCOVER_CHROME_STAGE_ORDER: DiscoverChromeProbeStage[] = [
  '4A',
  '4B',
  '4C',
  '4D1',
  '4D2',
  '4D3',
  '4D4',
  '4D5',
  '4D6',
  '4D7',
  '4D8',
  '4E',
];

export function discoverChromeStageIndex(stage: DiscoverChromeProbeStage): number {
  return DISCOVER_CHROME_STAGE_ORDER.indexOf(stage);
}

export function isDiscoverChromeStageAtLeast(
  stage: DiscoverChromeProbeStage,
  minimum: DiscoverChromeProbeStage,
): boolean {
  return discoverChromeStageIndex(stage) >= discoverChromeStageIndex(minimum);
}

export const DISCOVER_CHROME_STAGE_DEFINITIONS: Record<
  DiscoverChromeProbeStage,
  { label: string; newDelta: string }
> = {
  '4A': {
    label: 'DISCOVER 4A',
    newDelta: 'ListHeaderComponent = production SafeAreaView shell only (no back, title, or filters)',
  },
  '4B': {
    label: 'DISCOVER 4B',
    newDelta: 'ListHeaderComponent += DetailBackButton + production title',
  },
  '4C': {
    label: 'DISCOVER 4C',
    newDelta: 'ListHeaderComponent += filters button + ActiveFilterChips (full production header)',
  },
  '4D1': {
    label: 'DISCOVER 4D1',
    newDelta: 'Outer root only: probeRoot → commonStyles.screen (FlatList props unchanged from 4C)',
  },
  '4D2': {
    label: 'DISCOVER 4D2',
    newDelta: 'FlatList style only: flex:1 probeList → undefined (production FlatList style contract)',
  },
  '4D3': {
    label: 'DISCOVER 4D3',
    newDelta:
      'contentContainerStyle only: fixed probe padding → production conditional listContent | emptyListContent',
  },
  '4D4': {
    label: 'DISCOVER 4D4',
    newDelta: 'ListEmptyComponent only: production conditional loading/error/empty',
  },
  '4D5': {
    label: 'DISCOVER 4D5',
    newDelta: 'ListFooterComponent only: production pagination ActivityIndicator',
  },
  '4D6': {
    label: 'DISCOVER 4D6',
    newDelta: 'refreshControl only: MovieAppRefreshControl',
  },
  '4D7': {
    label: 'DISCOVER 4D7',
    newDelta: 'onEndReached + onEndReachedThreshold only',
  },
  '4D8': {
    label: 'DISCOVER 4D8',
    newDelta:
      'FlatList tuning only: showsVerticalScrollIndicator, keyboardShouldPersistTaps, virtualization props, production testID (reconstructs old failing 4D)',
  },
  '4E': {
    label: 'DISCOVER 4E',
    newDelta: 'DiscoverFilterSheet overlay only (full production discover-browse)',
  },
};

/** 4D8 cumulative props match the old monolithic 4D probe (pre-4D1 split). */
export const DISCOVER_4D8_RECONSTRUCTS_OLD_4D = [
  'commonStyles.screen root',
  'FlatList with no flex:1 style',
  'conditional contentContainerStyle',
  'ListEmptyComponent',
  'ListFooterComponent',
  'refreshControl',
  'onEndReached + onEndReachedThreshold=0.4',
  'showsVerticalScrollIndicator=false',
  'keyboardShouldPersistTaps=handled',
  'initialNumToRender / maxToRenderPerBatch / windowSize',
  'testID discover-browse-list',
  'full production ListHeaderComponent (from 4C)',
  'NO DiscoverFilterSheet (that is 4E only)',
];

/**
 * Production fix: Android list surfaces that previously attached MovieAppRefreshControl
 * directly to FlatList.refreshControl now use PlatformRefreshFlatList, matching Home/Insights.
 * iOS keeps MovieAppRefreshControl via createIosRefreshControl.
 */
export const DISCOVER_REFRESH_ROOT_CAUSE = [
  'Android FlatList.refreshControl with native RefreshControl blacked out discover-browse at 4D6.',
  'Home/Insights already avoid Android refreshControl and use useAndroidPullToRefresh instead.',
  'Fix: PlatformRefreshFlatList — iOS refreshControl + Android custom pull header/gesture.',
];
