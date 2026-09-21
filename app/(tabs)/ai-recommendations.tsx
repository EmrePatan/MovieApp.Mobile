import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AiRecommendationsContent } from '@/features/ai-recommendations/components/AiRecommendationsContent';
import { useTrackProductMetricOnFocus } from '@/features/metrics/use-track-product-metric-on-focus';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { colors } from '@/theme/colors';

export default function AiRecommendationsScreen() {
  useTrackProductMetricOnFocus(PRODUCT_METRICS.aiRecommendationsOpened);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AiRecommendationsContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
