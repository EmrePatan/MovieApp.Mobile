import { getAppEnvironment } from '@/api/environment';

type InsightsPerfEvent =
  | 'insights_mount'
  | 'insights_v3_api_start'
  | 'insights_v3_api_end'
  | 'insights_v3_render'
  | 'insights_first_meaningful_render';

let traceActive = false;
let originMs = 0;
let firstMeaningfulRenderLogged = false;

export function isInsightsPerfTracingEnabled(): boolean {
  const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;
  return isDevBuild && getAppEnvironment() !== 'production';
}

export function beginInsightsTrace(): void {
  if (!isInsightsPerfTracingEnabled()) {
    return;
  }

  traceActive = true;
  originMs = Date.now();
  firstMeaningfulRenderLogged = false;
  logEvent('insights_mount');
}

export function markInsightsPerfEvent(event: InsightsPerfEvent): void {
  if (!isInsightsPerfTracingEnabled() || !traceActive) {
    return;
  }

  if (event === 'insights_first_meaningful_render') {
    if (firstMeaningfulRenderLogged) {
      return;
    }

    firstMeaningfulRenderLogged = true;
  }

  logEvent(event);
}

export function resetInsightsTrace(): void {
  traceActive = false;
  originMs = 0;
  firstMeaningfulRenderLogged = false;
}

function logEvent(event: InsightsPerfEvent): void {
  const elapsedMs = Date.now() - originMs;
  console.log(`[PERF][INSIGHTS] ${event} +${elapsedMs}ms`);
}
