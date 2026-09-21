import { useEffect, type ReactNode } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
import {
  ROUTE_OWNERSHIP_AUDIT,
  ROUTE_OWNERSHIP_FIRST_DIVERGENCE,
} from './route-ownership-audit';
import { logRouteScreenMount, useRouteScreenProbe } from './route-screen-probe';
import { logNavigationDiagnostic } from './navigation-diagnostics';

/** Bump on device to progress isolation stages (0–5). DEV Android only. */
export const DISCOVER_ROUTE_PROBE_STAGE = 0 as 0 | 1 | 2 | 3 | 4 | 5;

interface DiscoverRouteProbeProps {
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  production: ReactNode;
  items: SearchResultItem[];
  listHeader: ReactNode;
  onPress: (item: SearchResultItem) => void;
}

const PRIMITIVE_ROWS = [1, 2, 3];

export function DiscoverRouteProbe({
  stage,
  production,
  items,
  listHeader,
  onPress,
}: DiscoverRouteProbeProps) {
  const { pathname, segments, onRootLayout } = useRouteScreenProbe('discover-browse', { stage });

  useEffect(() => {
    logRouteScreenMount('discover-browse', {
      stage,
      pathname,
      segments,
      ownership: ROUTE_OWNERSHIP_AUDIT.discoverBrowse,
      divergences: ROUTE_OWNERSHIP_FIRST_DIVERGENCE,
    });
  }, [pathname, segments, stage]);

  useEffect(() => {
    logNavigationDiagnostic('discover-route-probe:render', {
      stage,
      pathname,
      segments,
      itemCount: items.length,
    });
  });

  if (stage === 5) {
    return production;
  }

  if (stage === 4) {
    return (
      <View
        testID="discover-route-probe-stage-4"
        style={styles.probeRoot}
        collapsable={false}
        onLayout={onRootLayout}
      >
        <Text style={styles.probeLabel}>DISCOVER CONTROL 4</Text>
        <FlatList
          testID="discover-route-probe-list"
          data={items}
          keyExtractor={searchResultKeyExtractor}
          ListHeaderComponent={
            <View>
              <Text style={styles.probeSubLabel}>real data + SearchResultCard</Text>
              {listHeader}
            </View>
          }
          renderItem={({ item }) => <SearchResultCard item={item} onPress={onPress} />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  if (stage === 3) {
    return (
      <View
        testID="discover-route-probe-stage-3"
        style={styles.probeRoot}
        collapsable={false}
        onLayout={onRootLayout}
      >
        <Text style={styles.probeLabel}>DISCOVER CONTROL 3</Text>
        <FlatList
          testID="discover-route-probe-list"
          data={items}
          keyExtractor={searchResultKeyExtractor}
          ListHeaderComponent={<Text style={styles.probeSubLabel}>real data primitive rows</Text>}
          renderItem={({ item }) => (
            <View style={styles.primitiveRow}>
              <Text style={styles.rowText}>{item.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  if (stage === 2) {
    return (
      <View
        testID="discover-route-probe-stage-2"
        style={styles.probeRoot}
        collapsable={false}
        onLayout={onRootLayout}
      >
        <Text style={styles.probeLabel}>DISCOVER CONTROL 2</Text>
        <FlatList
          testID="discover-route-probe-list"
          data={PRIMITIVE_ROWS}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => (
            <View style={styles.primitiveRow}>
              <Text style={styles.rowText}>ROW {item}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  if (stage === 1) {
    return (
      <View
        testID="discover-route-probe-stage-1"
        style={styles.probeRoot}
        collapsable={false}
        onLayout={onRootLayout}
      >
        <Text style={styles.probeLabel}>DISCOVER CONTROL 1</Text>
        <Text style={styles.probeSubLabel}>plain header text only</Text>
      </View>
    );
  }

  return (
    <View
      testID="discover-route-control"
      style={styles.routeControl}
      collapsable={false}
      onLayout={onRootLayout}
    >
      <Text style={styles.routeControlText}>DISCOVER ROUTE CONTROL</Text>
      <Text style={styles.routeControlMeta}>{pathname}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  routeControl: {
    flex: 1,
    backgroundColor: '#FF00FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  routeControlText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  routeControlMeta: {
    color: '#000000',
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },
  probeRoot: {
    flex: 1,
    backgroundColor: '#1A0033',
  },
  probeLabel: {
    color: '#00FFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#330066',
  },
  probeSubLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  primitiveRow: {
    height: 80,
    marginHorizontal: 24,
    marginVertical: 8,
    backgroundColor: '#FF8800',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rowText: {
    color: '#000000',
    fontWeight: '700',
  },
});
