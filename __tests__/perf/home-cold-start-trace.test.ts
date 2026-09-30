import { getAppEnvironment } from '@/api/environment';
import {
  beginHomeColdStartTrace,
  getActiveHomeTraceId,
  isHomePerfTracingEnabled,
  markHomePerfEvent,
  resetHomeColdStartTrace,
} from '@/perf/home-cold-start-trace';

jest.mock('@/api/environment', () => ({
  getAppEnvironment: jest.fn(() => 'development'),
}));

describe('home-cold-start-trace', () => {
  const originalDevFlag = (globalThis as { __DEV__?: boolean }).__DEV__;
  const originalPerfEnv = process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    delete process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
    (getAppEnvironment as jest.Mock).mockReturnValue('development');
    resetHomeColdStartTrace();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    resetHomeColdStartTrace();
    consoleLogSpy.mockRestore();
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDevFlag;
    if (originalPerfEnv === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = originalPerfEnv;
    }
  });

  it('is disabled by default and does not log perf events', () => {
    expect(isHomePerfTracingEnabled()).toBe(false);

    const traceId = beginHomeColdStartTrace();

    expect(traceId).toBeNull();
    expect(getActiveHomeTraceId()).toBeNull();
    markHomePerfEvent('home_mount');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('creates a trace id and records login_start when explicitly enabled', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';
    expect(isHomePerfTracingEnabled()).toBe(true);

    const traceId = beginHomeColdStartTrace();

    expect(traceId).toMatch(/^home-/);
    expect(getActiveHomeTraceId()).toBe(traceId);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\[PERF\]\[HOME\] login_start \+\d+ms trace=/),
    );
  });

  it('does not throw when marking events without an active trace', () => {
    expect(() => markHomePerfEvent('home_mount')).not.toThrow();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('records progressive home events when tracing is explicitly enabled', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';
    beginHomeColdStartTrace();
    consoleLogSpy.mockClear();

    markHomePerfEvent('home_browse_api_start');
    markHomePerfEvent('home_browse_api_end');
    markHomePerfEvent('home_personalized_api_start');
    markHomePerfEvent('home_personalized_api_end');
    markHomePerfEvent('home_personalized_render');

    expect(consoleLogSpy).toHaveBeenCalledTimes(5);
    expect(consoleLogSpy.mock.calls.every(([line]) => String(line).startsWith('[PERF][HOME]'))).toBe(
      true,
    );
  });
});
