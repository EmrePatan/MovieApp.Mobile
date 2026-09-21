import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';
import { spacing } from '@/theme/spacing';

interface StreamingBodyMountProbeProps {
  firstItem: SearchResultItem;
  onResultPress: (item: SearchResultItem) => void;
}

function logRender(probe: string, extra: Record<string, unknown> = {}): void {
  logNavigationDiagnostic(`${probe}:render`, extra);
}

function logLayout(probe: string, event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }): void {
  const { x, y, width, height } = event.nativeEvent.layout;
  logNavigationDiagnostic(`${probe}:layout`, { x, y, width, height });
}

/**
 * #45 v12 — direct CatalogScreenShell body mount ladder (DEV Android only).
 * Stages: A/B/C native Views → D bare ScrollView → E real title → F SearchResultCard.
 */
export function StreamingBodyMountProbe({
  firstItem,
  onResultPress,
}: StreamingBodyMountProbeProps) {
  useEffect(() => {
    logNavigationDiagnostic('streaming-body-mount-probe:committed', {
      itemId: firstItem.id,
      title: firstItem.title,
    });
  }, [firstItem.id, firstItem.title]);

  logRender('direct-a');
  logRender('direct-b');
  logRender('direct-c');
  logRender('control-d-wrapper');
  logRender('control-e-wrapper');
  logRender('control-f-wrapper');

  return (
    <>
      <View
        testID="direct-control-a"
        collapsable={false}
        style={styles.directA}
        onLayout={(event) => logLayout('direct-a', event)}
      >
        <Text style={styles.label}>DIRECT A</Text>
      </View>

      <View
        testID="direct-control-b"
        collapsable={false}
        style={styles.directB}
        onLayout={(event) => logLayout('direct-b', event)}
      >
        <Text style={styles.label}>DIRECT B</Text>
      </View>

      <View
        testID="direct-control-c"
        collapsable={false}
        style={styles.directC}
        onLayout={(event) => logLayout('direct-c', event)}
      >
        <Text style={styles.label}>{firstItem.title}</Text>
      </View>

      <View
        testID="control-d-wrapper"
        collapsable={false}
        style={styles.scrollStage}
        onLayout={(event) => logLayout('control-d-wrapper', event)}
      >
        <ScrollView
          collapsable={false}
          onLayout={(event) => logLayout('control-d-scroll', event)}
        >
          <View
            collapsable={false}
            style={styles.scrollChild}
            onLayout={(event) => logLayout('control-d-child', event)}
          >
            <Text style={styles.label}>SCROLL CHILD</Text>
          </View>
        </ScrollView>
      </View>

      <View
        testID="control-e-wrapper"
        collapsable={false}
        style={styles.scrollStage}
        onLayout={(event) => logLayout('control-e-wrapper', event)}
      >
        <ScrollView
          collapsable={false}
          onLayout={(event) => logLayout('control-e-scroll', event)}
        >
          <View
            collapsable={false}
            style={styles.scrollChild}
            onLayout={(event) => logLayout('control-e-child', event)}
          >
            <Text style={styles.label}>{firstItem.title}</Text>
          </View>
        </ScrollView>
      </View>

      <View
        testID="control-f-wrapper"
        collapsable={false}
        style={styles.scrollStage}
        onLayout={(event) => logLayout('control-f-wrapper', event)}
      >
        <ScrollView
          collapsable={false}
          onLayout={(event) => logLayout('control-f-scroll', event)}
        >
          <View
            collapsable={false}
            onLayout={(event) => logLayout('control-f-child', event)}
          >
            <SearchResultCard item={firstItem} onPress={onResultPress} layoutProbe />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  directA: {
    height: 80,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  directB: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00FF00',
    borderWidth: 2,
    borderColor: '#000000',
  },
  directC: {
    height: 80,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0000FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollStage: {
    height: 140,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: '#FFFF00',
    backgroundColor: '#1A1A1A',
  },
  scrollChild: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8800',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
