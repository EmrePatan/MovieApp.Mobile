import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LibraryHubContent } from '@/features/library/components/LibraryHubContent';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { colors } from '@/theme/colors';

export default function LibraryTabScreen() {
  useTrackProductMetricOnFocus(PRODUCT_METRICS.libraryOpened);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <LibraryHubContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
