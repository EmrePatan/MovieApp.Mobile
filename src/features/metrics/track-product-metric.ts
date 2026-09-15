import { postProductMetric } from './api/product-metrics-api';
import type { ProductMetricName } from './product-metric-types';

const inFlightMetrics = new Set<ProductMetricName>();
const recentFocusMetrics = new Map<ProductMetricName, number>();
const FOCUS_DEDUPE_WINDOW_MS = 1_000;

export function resetProductMetricTrackingForTests(): void {
  inFlightMetrics.clear();
  recentFocusMetrics.clear();
}

export function trackProductMetric(metricName: ProductMetricName): void {
  void postProductMetric(metricName).catch(() => {
    // Best-effort metrics must never affect UX.
  });
}

export function trackProductMetricOnFocus(metricName: ProductMetricName): void {
  const now = Date.now();
  const lastTrackedAt = recentFocusMetrics.get(metricName) ?? 0;

  if (now - lastTrackedAt < FOCUS_DEDUPE_WINDOW_MS) {
    return;
  }

  if (inFlightMetrics.has(metricName)) {
    return;
  }

  recentFocusMetrics.set(metricName, now);
  inFlightMetrics.add(metricName);

  void postProductMetric(metricName)
    .catch(() => {
      // Best-effort metrics must never affect UX.
    })
    .finally(() => {
      inFlightMetrics.delete(metricName);
    });
}
