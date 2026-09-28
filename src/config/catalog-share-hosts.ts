const DEFAULT_CANONICAL_HOST = 'moviecaveapp.com';

function parseWebUrlHost(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value.trim()).hostname;
  } catch {
    return null;
  }
}

/** Canonical share / OG host (moviecaveapp.com). */
export function getCatalogShareCanonicalHost(): string {
  return parseWebUrlHost(process.env.EXPO_PUBLIC_APP_WEB_URL) ?? DEFAULT_CANONICAL_HOST;
}

/** App-open handoff host (open.moviecaveapp.com). */
export function getCatalogShareAppOpenHost(): string {
  const configured = process.env.EXPO_PUBLIC_APP_OPEN_WEB_URL?.trim();
  const configuredHost = parseWebUrlHost(configured);
  if (configuredHost) {
    return configuredHost;
  }

  return `open.${getCatalogShareCanonicalHost()}`;
}

export function getCatalogShareUniversalLinkHosts(): string[] {
  const canonical = getCatalogShareCanonicalHost();
  const appOpen = getCatalogShareAppOpenHost();
  if (canonical === appOpen) {
    return [canonical];
  }

  return [canonical, appOpen];
}
