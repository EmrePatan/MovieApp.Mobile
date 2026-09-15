import { api } from '@/api/client';
import { postProductMetric } from '@/features/metrics/api/product-metrics-api';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';

jest.mock('@/api/client', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('postProductMetric', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts allow-listed metric names without authentication', async () => {
    (api.post as jest.Mock).mockResolvedValue(undefined);

    await postProductMetric(PRODUCT_METRICS.discoverOpened);

    expect(api.post).toHaveBeenCalledWith(
      '/api/product-metrics/increment',
      { metricName: PRODUCT_METRICS.discoverOpened },
      { authenticated: false, signal: undefined },
    );
  });
});
