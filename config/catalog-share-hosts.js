const DEFAULT_CANONICAL_HOST = 'moviecaveapp.com';

function parseWebUrlHost(value) {
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
function getCatalogShareCanonicalHost() {
  return parseWebUrlHost(process.env.EXPO_PUBLIC_APP_WEB_URL) ?? DEFAULT_CANONICAL_HOST;
}

/** App-open handoff host (open.moviecaveapp.com). */
function getCatalogShareAppOpenHost() {
  const configuredHost = parseWebUrlHost(process.env.EXPO_PUBLIC_APP_OPEN_WEB_URL);
  if (configuredHost) {
    return configuredHost;
  }

  return `open.${getCatalogShareCanonicalHost()}`;
}

function getCatalogShareUniversalLinkHosts() {
  const canonical = getCatalogShareCanonicalHost();
  const appOpen = getCatalogShareAppOpenHost();
  if (canonical === appOpen) {
    return [canonical];
  }

  return [canonical, appOpen];
}

module.exports = {
  getCatalogShareAppOpenHost,
  getCatalogShareCanonicalHost,
  getCatalogShareUniversalLinkHosts,
};
