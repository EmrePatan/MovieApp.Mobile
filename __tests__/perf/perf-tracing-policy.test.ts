import { getAppEnvironment } from '@/api/environment';
import { isExplicitPerfTracingEnabled, isPerfTracingEnabled } from '@/perf/perf-tracing-policy';

jest.mock('@/api/environment', () => ({
  getAppEnvironment: jest.fn(() => 'development'),
}));

describe('perf-tracing-policy', () => {
  const originalDevFlag = (globalThis as { __DEV__?: boolean }).__DEV__;
  const originalPerfEnv = process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;

  beforeEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    delete process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
    (getAppEnvironment as jest.Mock).mockReturnValue('development');
  });

  afterEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDevFlag;
    if (originalPerfEnv === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = originalPerfEnv;
    }
  });

  it('is off by default in development dev builds', () => {
    expect(isExplicitPerfTracingEnabled()).toBe(false);
    expect(isPerfTracingEnabled()).toBe(false);
  });

  it('enables tracing only when explicitly opted in for dev non-production', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';

    expect(isPerfTracingEnabled()).toBe(true);
  });

  it('accepts "1" as an explicit opt-in value', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = '1';

    expect(isExplicitPerfTracingEnabled()).toBe(true);
    expect(isPerfTracingEnabled()).toBe(true);
  });

  it('remains off in production even when opt-in is set', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';
    (getAppEnvironment as jest.Mock).mockReturnValue('production');

    expect(isPerfTracingEnabled()).toBe(false);
  });

  it('remains off when not in a dev build even when opt-in is set', () => {
    process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING = 'true';
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;

    expect(isPerfTracingEnabled()).toBe(false);
  });
});
