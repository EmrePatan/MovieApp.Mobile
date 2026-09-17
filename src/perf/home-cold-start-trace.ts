import { getAppEnvironment } from '@/api/environment';

type HomePerfEvent =
  | 'login_start'
  | 'login_response'
  | 'session_established'
  | 'home_mount'
  | 'home_api_start'
  | 'home_api_end'
  | 'home_browse_api_start'
  | 'home_browse_api_end'
  | 'home_personalized_api_start'
  | 'home_personalized_api_end'
  | 'first_meaningful_render'
  | 'home_personalized_render';

let traceId: string | null = null;
let originMs = 0;

export function isHomePerfTracingEnabled(): boolean {
  const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;
  return isDevBuild && getAppEnvironment() !== 'production';
}

export function beginHomeColdStartTrace(): string | null {
  if (!isHomePerfTracingEnabled()) {
    return null;
  }

  traceId = createTraceId();
  originMs = Date.now();
  logEvent('login_start');
  return traceId;
}

export function markHomePerfEvent(event: HomePerfEvent): void {
  if (!isHomePerfTracingEnabled() || originMs === 0) {
    return;
  }

  logEvent(event);
}

export function getActiveHomeTraceId(): string | null {
  return traceId;
}

export function resetHomeColdStartTrace(): void {
  traceId = null;
  originMs = 0;
}

function logEvent(event: HomePerfEvent): void {
  const elapsedMs = Date.now() - originMs;
  const traceSuffix = traceId ? ` trace=${traceId}` : '';
  console.log(`[PERF][HOME] ${event} +${elapsedMs}ms${traceSuffix}`);
}

function createTraceId(): string {
  return `home-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
