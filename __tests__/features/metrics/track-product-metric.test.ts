import { postProductMetric } from '@/features/metrics/api/product-metrics-api';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import {
  resetProductMetricTrackingForTests,
  trackProductMetric,
  trackProductMetricOnFocus,
} from '@/features/metrics/track-product-metric';

jest.mock('@/features/metrics/api/product-metrics-api', () => ({
  postProductMetric: jest.fn(),
}));

describe('trackProductMetric', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetProductMetricTrackingForTests();
  });

  it('fires best-effort metric requests without throwing on failure', async () => {
    (postProductMetric as jest.Mock).mockRejectedValue(new Error('network down'));

    expect(() => trackProductMetric(PRODUCT_METRICS.discoverOpened)).not.toThrow();
    await Promise.resolve();
  });

  it('deduplicates focus metrics during rapid re-renders', async () => {
    (postProductMetric as jest.Mock).mockResolvedValue(undefined);

    trackProductMetricOnFocus(PRODUCT_METRICS.streamingServicesOpened);
    trackProductMetricOnFocus(PRODUCT_METRICS.streamingServicesOpened);
    trackProductMetricOnFocus(PRODUCT_METRICS.streamingServicesOpened);

    await Promise.resolve();

    expect(postProductMetric).toHaveBeenCalledTimes(1);
    expect(postProductMetric).toHaveBeenCalledWith(PRODUCT_METRICS.streamingServicesOpened);
  });
});
