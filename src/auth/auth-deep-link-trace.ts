import type { AuthDeepLinkTarget } from '@/auth/auth-deep-link';

export type AuthDeepLinkTraceStage =
  | 'listener_init'
  | 'launch_url_read'
  | 'pending_stored'
  | 'native_intent_redirect'
  | 'restore_skipped_loading'
  | 'restore_navigate'
  | 'restore_complete'
  | 'guard_blocked'
  | 'verify_screen_mount'
  | 'verify_request_start';

type AuthDeepLinkTraceDetail = {
  stage: AuthDeepLinkTraceStage;
  flow?: AuthDeepLinkTarget['kind'];
  initial?: boolean;
  hasUrl?: boolean;
  segment?: string;
};

const traceBuffer: AuthDeepLinkTraceDetail[] = [];
const MAX_TRACE_ENTRIES = 32;

function pushTrace(detail: AuthDeepLinkTraceDetail): void {
  traceBuffer.push(detail);
  if (traceBuffer.length > MAX_TRACE_ENTRIES) {
    traceBuffer.shift();
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.info('[auth-deep-link]', detail);
  }
}

export function traceAuthDeepLink(
  stage: AuthDeepLinkTraceStage,
  options?: Omit<AuthDeepLinkTraceDetail, 'stage'>,
): void {
  pushTrace({ stage, ...options });
}

export function getAuthDeepLinkTraceSnapshot(): AuthDeepLinkTraceDetail[] {
  return [...traceBuffer];
}

export function resetAuthDeepLinkTraceForTests(): void {
  traceBuffer.length = 0;
}
