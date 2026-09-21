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

export type DiscoverChromeProbeStage = '4A' | '4B' | '4C' | '4D' | '4E';

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
  '4D': {
    label: 'DISCOVER 4D',
    newDelta:
      'FlatList += ListEmptyComponent, ListFooterComponent, refreshControl, onEndReached, virtualization props, conditional contentContainerStyle; outer root → commonStyles.screen',
  },
  '4E': {
    label: 'DISCOVER 4E',
    newDelta: 'Full production discover-browse including DiscoverFilterSheet overlay',
  },
};
