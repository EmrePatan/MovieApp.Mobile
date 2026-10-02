import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LibraryHubContent } from '@/features/library/components/LibraryHubContent';
import { LibraryHubSearchProvider } from '@/features/library/context/LibraryHubSearchContext';
import { TabTopChrome } from '@/features/navigation/components/TabTopChrome';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { colors } from '@/theme/colors';

export default function LibraryTabScreen() {
  useTrackProductMetricOnFocus(PRODUCT_METRICS.libraryOpened);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <LibraryHubSearchProvider>
        <View style={styles.content}>
          <TabTopChrome searchOrigin="library" />
          <LibraryHubContent />
        </View>
      </LibraryHubSearchProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
