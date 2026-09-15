import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import type { ProductMetricName } from './product-metric-types';
import { trackProductMetricOnFocus } from './track-product-metric';

export function useTrackProductMetricOnFocus(
  metricName: ProductMetricName,
  enabled = true,
): void {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      trackProductMetricOnFocus(metricName);
    }, [enabled, metricName]),
  );
}
