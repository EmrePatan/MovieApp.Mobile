import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InsightsHubContent } from '@/features/insights/components/InsightsHubContent';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { colors } from '@/theme/colors';

export default function InsightsTabScreen() {
  useTrackProductMetricOnFocus(PRODUCT_METRICS.insightsOpened);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <InsightsHubContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
