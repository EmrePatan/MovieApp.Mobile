import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DiscoverHubContent } from '@/features/discover/components/DiscoverHubContent';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { colors } from '@/theme/colors';

export default function DiscoverTabScreen() {
  useTrackProductMetricOnFocus(PRODUCT_METRICS.discoverOpened);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <DiscoverHubContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
