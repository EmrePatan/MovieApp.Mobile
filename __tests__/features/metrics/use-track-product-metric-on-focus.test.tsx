import { renderHook } from '@testing-library/react-native';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetricOnFocus } from '@/features/metrics/track-product-metric';

jest.unmock('@/features/metrics/use-track-product-metric-on-focus');

const { useTrackProductMetricOnFocus } =
  require('@/features/metrics/use-track-product-metric-on-focus') as typeof import('@/features/metrics/use-track-product-metric-on-focus');

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetricOnFocus: jest.fn(),
}));

describe('useTrackProductMetricOnFocus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks once per focus when enabled', () => {
    renderHook(() => useTrackProductMetricOnFocus(PRODUCT_METRICS.discoverOpened, true));

    expect(trackProductMetricOnFocus).toHaveBeenCalledTimes(1);
    expect(trackProductMetricOnFocus).toHaveBeenCalledWith(PRODUCT_METRICS.discoverOpened);
  });

  it('does not track when disabled', () => {
    renderHook(() => useTrackProductMetricOnFocus(PRODUCT_METRICS.discoverOpened, false));

    expect(trackProductMetricOnFocus).not.toHaveBeenCalled();
  });

  it('tracks library_opened once per focus when enabled', () => {
    renderHook(() => useTrackProductMetricOnFocus(PRODUCT_METRICS.libraryOpened, true));

    expect(trackProductMetricOnFocus).toHaveBeenCalledTimes(1);
    expect(trackProductMetricOnFocus).toHaveBeenCalledWith(PRODUCT_METRICS.libraryOpened);
  });
});
