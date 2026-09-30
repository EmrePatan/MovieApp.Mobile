import { getAppEnvironment } from '@/api/environment';
import {
  beginInsightsTrace,
  isInsightsPerfTracingEnabled,
  markInsightsPerfEvent,
  resetInsightsTrace,
} from '@/perf/insights-trace';

jest.mock('@/api/environment', () => ({
  getAppEnvironment: jest.fn(() => 'development'),
}));

describe('insights-trace', () => {
  const originalDevFlag = (globalThis as { __DEV__?: boolean }).__DEV__;
  const originalPerfEnv = process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    delete process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
    (getAppEnvironment as jest.Mock).mockReturnValue('development');
    resetInsightsTrace();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    resetInsightsTrace();
    consoleLogSpy.mockRestore();
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDevFlag;
    if (originalPerfEnv === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = originalPerfEnv;
    }
  });

  it('is disabled by default and does not log perf events', () => {
    expect(isInsightsPerfTracingEnabled()).toBe(false);

    beginInsightsTrace();
    markInsightsPerfEvent('insights_v3_api_start');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('logs insights events when explicitly enabled in dev non-production', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';

    beginInsightsTrace();
    consoleLogSpy.mockClear();
    markInsightsPerfEvent('insights_v3_api_end');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\[PERF\]\[INSIGHTS\] insights_v3_api_end \+\d+ms$/),
    );
  });

  it('does not log in production even when opt-in is set', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';
    (getAppEnvironment as jest.Mock).mockReturnValue('production');

    beginInsightsTrace();
    markInsightsPerfEvent('insights_mount');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
