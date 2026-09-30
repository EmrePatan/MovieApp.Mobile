import { getAppEnvironment } from '@/api/environment';

/**
 * Explicit opt-in for client-side perf console tracing (HOME / INSIGHTS).
 * Set EXPO_PUBLIC_ENABLE_PERF_TRACING=true in .env when investigating performance.
 */
export function isExplicitPerfTracingEnabled(): boolean {
  const value = process.env.EXPO_PUBLIC_ENABLE_PERF_TRACING?.trim().toLowerCase();
  return value === 'true' || value === '1';
}

export function isPerfTracingEnabled(): boolean {
  const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;
  if (!isDevBuild) {
    return false;
  }

  if (getAppEnvironment() === 'production') {
    return false;
  }

  return isExplicitPerfTracingEnabled();
}
