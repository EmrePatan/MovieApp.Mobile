import * as Linking from 'expo-linking';
import { parseAuthDeepLink, type AuthDeepLinkTarget } from '@/auth/auth-deep-link';

let pendingAuthDeepLink: AuthDeepLinkTarget | null = null;
let listenerInitialized = false;

export function captureAuthDeepLink(url: string | null | undefined): void {
  const parsed = parseAuthDeepLink(url);
  if (parsed) {
    pendingAuthDeepLink = parsed;
  }
}

export function hasPendingAuthDeepLink(): boolean {
  return pendingAuthDeepLink !== null;
}

export function consumePendingAuthDeepLink(): AuthDeepLinkTarget | null {
  const target = pendingAuthDeepLink;
  pendingAuthDeepLink = null;
  return target;
}

export function resetPendingAuthDeepLinkForTests(): void {
  pendingAuthDeepLink = null;
  listenerInitialized = false;
}

export function ensureAuthDeepLinkListener(): void {
  if (listenerInitialized) {
    return;
  }

  listenerInitialized = true;
  void Linking.getInitialURL().then(captureAuthDeepLink);
  Linking.addEventListener('url', ({ url }) => {
    captureAuthDeepLink(url);
  });
}
