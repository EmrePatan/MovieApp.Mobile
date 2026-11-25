const LOOPBACK_HOST = /^(?:localhost|127(?:\.\d{1,3}){3}|10\.0\.2\.2|\[::1\])$/i;

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * The dev backend builds media URLs from its own public base (`http://localhost:5027`),
 * which a physical device cannot reach. When such a URL comes back, serve it from the
 * origin the app already uses for the API (e.g. the LAN address). No-op for any other host.
 */
export function rewriteLoopbackMediaUrl(
  url: string | null | undefined,
  apiBaseUrl: string | undefined = process.env.EXPO_PUBLIC_API_URL,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }

  const media = parseUrl(trimmed);
  const api = apiBaseUrl ? parseUrl(apiBaseUrl.trim()) : null;
  if (!media || !api || !LOOPBACK_HOST.test(media.hostname) || LOOPBACK_HOST.test(api.hostname)) {
    return trimmed;
  }

  return `${api.origin}${media.pathname}${media.search}`;
}
