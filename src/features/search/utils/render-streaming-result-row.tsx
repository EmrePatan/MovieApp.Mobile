import { Pressable, StyleSheet, Text, View } from 'react-native';
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import {
  logRouteLayoutMeta,
  routeLayoutHandler,
  type RouteLayoutContext,
} from '@/debug/route-layout-probe';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { renderSearchResultRow } from '@/features/search/utils/render-search-result-row';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const LAYOUT_SCOPE = 'streaming-discover';

interface RenderStreamingResultRowOptions {
  route: RouteLayoutContext;
  item: SearchResultItem;
  index: number;
  onPress: (item: SearchResultItem) => void;
}

/**
 * #45 streaming-only A/B row probe. DEV diagnostics at index 0; production uses shared row renderer.
 */
export function renderStreamingResultRow({
  route,
  item,
  index,
  onPress,
}: RenderStreamingResultRowOptions) {
  if (!__DEV__ || index !== 0) {
    return renderSearchResultRow({
      layoutScope: LAYOUT_SCOPE,
      route,
      item,
      index,
      onPress,
    });
  }

  logNavigationDiagnostic('streaming-control:render:index0', {
    pathname: route.pathname,
    itemId: item.id,
    title: item.title,
  });

  logRouteLayoutMeta(LAYOUT_SCOPE, route, {
    renderItemIndex0: true,
    itemComponent: 'SearchResultCard+ab-control',
    itemId: item.id,
  });

  return (
    <View
      collapsable={false}
      testID="streaming-results-wrapper-index0"
      onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'results-wrapper:index0', route, {
        itemId: item.id,
      })}
    >
      <View
        collapsable={false}
        style={styles.resultControl}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          logNavigationDiagnostic('streaming-control:layout:index0', {
            pathname: route.pathname,
            itemId: item.id,
            x,
            y,
            width,
            height,
          });
        }}
      >
        <Text style={styles.resultControlLabel}>RESULT CONTROL</Text>
        <Text style={styles.resultControlTitle}>{item.title}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(item)}
        style={styles.minimalPressable}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          logNavigationDiagnostic('streaming-minimal:layout:index0', {
            pathname: route.pathname,
            itemId: item.id,
            x,
            y,
            width,
            height,
          });
        }}
      >
        <Text style={styles.minimalPressableTitle}>{item.title}</Text>
      </Pressable>

      <View
        collapsable={false}
        onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'card-host:index0', route, {
          itemId: item.id,
          itemComponent: 'SearchResultCard',
        })}
      >
        <SearchResultCard item={item} onPress={onPress} layoutProbe />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultControl: {
    height: 120,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    backgroundColor: '#FF00FF',
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  resultControlLabel: {
    color: '#000000',
    fontWeight: '800',
  },
  resultControlTitle: {
    color: '#000000',
    marginTop: spacing.xs,
  },
  minimalPressable: {
    minHeight: 56,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  minimalPressableTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
