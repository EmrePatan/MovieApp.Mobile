import * as Linking from 'expo-linking';
import { parseAuthDeepLink, type AuthDeepLinkTarget } from '@/auth/auth-deep-link';
import { traceAuthDeepLink } from '@/auth/auth-deep-link-trace';

let pendingAuthDeepLink: AuthDeepLinkTarget | null = null;
let restoreInFlight = false;
let listenerInitialized = false;

function readLaunchAuthDeepLinkUrl(): string | null {
  const linkingUrl = Linking.getLinkingURL?.() ?? null;
  return linkingUrl;
}

export function captureAuthDeepLink(url: string | null | undefined): void {
  const parsed = parseAuthDeepLink(url);
  if (!parsed) {
    return;
  }

  pendingAuthDeepLink = parsed;
  restoreInFlight = true;
  traceAuthDeepLink('pending_stored', { flow: parsed.kind, hasUrl: true });
}

export function hasPendingAuthDeepLink(): boolean {
  return pendingAuthDeepLink !== null;
}

export function peekPendingAuthDeepLink(): AuthDeepLinkTarget | null {
  return pendingAuthDeepLink;
}

export function isAuthDeepLinkRestorePending(): boolean {
  return restoreInFlight || pendingAuthDeepLink !== null;
}

export function consumePendingAuthDeepLink(): AuthDeepLinkTarget | null {
  const target = pendingAuthDeepLink;
  pendingAuthDeepLink = null;
  if (target) {
    restoreInFlight = true;
  }
  return target;
}

export function markAuthDeepLinkRestoreComplete(): void {
  restoreInFlight = false;
  pendingAuthDeepLink = null;
  traceAuthDeepLink('restore_complete');
}

export function resetPendingAuthDeepLinkForTests(): void {
  pendingAuthDeepLink = null;
  restoreInFlight = false;
  listenerInitialized = false;
}

export function ensureAuthDeepLinkListener(): void {
  if (listenerInitialized) {
    return;
  }

  listenerInitialized = true;
  traceAuthDeepLink('listener_init');

  const launchUrl = readLaunchAuthDeepLinkUrl();
  if (launchUrl) {
    traceAuthDeepLink('launch_url_read', {
      hasUrl: true,
      flow: parseAuthDeepLink(launchUrl)?.kind,
    });
    captureAuthDeepLink(launchUrl);
  }

  void Linking.getInitialURL().then((url) => {
    if (!hasPendingAuthDeepLink() && !restoreInFlight) {
      if (url) {
        traceAuthDeepLink('launch_url_read', {
          hasUrl: true,
          flow: parseAuthDeepLink(url)?.kind,
        });
      }
      captureAuthDeepLink(url);
    }
  });

  Linking.addEventListener('url', ({ url }) => {
    captureAuthDeepLink(url);
  });
}
