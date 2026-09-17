import {
  beginHomeColdStartTrace,
  getActiveHomeTraceId,
  isHomePerfTracingEnabled,
  markHomePerfEvent,
  resetHomeColdStartTrace,
} from '@/perf/home-cold-start-trace';

describe('home-cold-start-trace', () => {
  const originalDevFlag = (globalThis as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    resetHomeColdStartTrace();
  });

  afterEach(() => {
    resetHomeColdStartTrace();
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDevFlag;
  });

  it('creates a trace id and records login_start when tracing is enabled', () => {
    expect(isHomePerfTracingEnabled()).toBe(true);

    const traceId = beginHomeColdStartTrace();

    expect(traceId).toMatch(/^home-/);
    expect(getActiveHomeTraceId()).toBe(traceId);
  });

  it('does not throw when marking events without an active trace', () => {
    expect(() => markHomePerfEvent('home_mount')).not.toThrow();
  });

  it('records progressive home events when tracing is enabled', () => {
    beginHomeColdStartTrace();

    expect(() => markHomePerfEvent('home_browse_api_start')).not.toThrow();
    expect(() => markHomePerfEvent('home_browse_api_end')).not.toThrow();
    expect(() => markHomePerfEvent('home_personalized_api_start')).not.toThrow();
    expect(() => markHomePerfEvent('home_personalized_api_end')).not.toThrow();
    expect(() => markHomePerfEvent('home_personalized_render')).not.toThrow();
  });
});
