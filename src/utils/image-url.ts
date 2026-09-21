/**
 * Optional override for backend-relative TMDB image paths.
 * When unset, relative paths default to the public TMDB image CDN.
 */
export function getImageBaseUrl(): string | null {
  const base = process.env.EXPO_PUBLIC_IMAGE_BASE_URL?.trim();
  if (!base) {
    return null;
  }
  return base.replace(/\/+$/, '');
}

const DEFAULT_TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

function getEffectiveImageBase(): string {
  return getImageBaseUrl() ?? DEFAULT_TMDB_IMAGE_BASE;
}

export type ImageSize = 'w92' | 'w300' | 'w500' | 'original';

/**
 * Normalizes raw catalog image paths before URL resolution.
 * Supports protocol-relative TMDB URLs (`//image.tmdb.org/...`).
 */
export function normalizeImagePathInput(path: string): string {
  const trimmed = path.trim();

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return trimmed;
}

const TMDB_IMAGE_HOST = 'image.tmdb.org';

function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isTmdbHost(hostname: string): boolean {
  return hostname === TMDB_IMAGE_HOST;
}

function isTmdbUrl(url: string): boolean {
  const parsed = tryParseUrl(url);
  return parsed ? isTmdbHost(parsed.hostname) : false;
}

function isTmdbBase(base: string): boolean {
  return isTmdbUrl(base.startsWith('http') ? base : `https://${base}`);
}

function sizeSegment(size: ImageSize): string {
  return size === 'original' ? 'original' : size;
}

/**
 * Strips a leading TMDB size segment from a relative file path.
 * `/w500/abc.jpg` and `/abc.jpg` both normalize to `/abc.jpg`.
 */
export function normalizeTmdbFilePath(path: string): string {
  let normalized = path.trim();
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  return normalized.replace(/^\/w\d+\//, '/').replace(/^\/original\//, '/');
}

/**
 * Builds a canonical TMDB image URL with exactly one size segment.
 */
export function buildTmdbImageUrl(filePath: string, size: ImageSize = 'w500'): string {
  const file = normalizeTmdbFilePath(filePath);
  return `https://image.tmdb.org/t/p/${sizeSegment(size)}${file}`;
}

/**
 * Normalizes absolute TMDB URLs so size is applied exactly once.
 */
export function normalizeTmdbAbsoluteUrl(url: string, size: ImageSize = 'w500'): string {
  const parsed = tryParseUrl(url);
  if (!parsed || !isTmdbHost(parsed.hostname)) {
    return url;
  }

  const pathParts = parsed.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2 || pathParts[0] !== 't' || pathParts[1] !== 'p') {
    return url;
  }

  let fileStartIndex = 2;
  const maybeSize = pathParts[fileStartIndex];
  if (maybeSize === 'original' || /^w\d+$/.test(maybeSize ?? '')) {
    fileStartIndex += 1;
  }

  const filePath = `/${pathParts.slice(fileStartIndex).join('/')}`;
  return buildTmdbImageUrl(filePath, size);
}

let lastDevImageResolutionLogKey: string | null = null;

/**
 * DEV-only helper for tracing poster path resolution without logging secrets.
 */
export function logImageResolutionInDev(
  rawPath: string,
  resolvedUri: string | null,
): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }

  const logKey = `${rawPath}=>${resolvedUri ?? 'null'}`;
  if (lastDevImageResolutionLogKey === logKey) {
    return;
  }

  lastDevImageResolutionLogKey = logKey;
  console.debug('[image] resolved catalog path', {
    rawPath,
    resolvedUri,
  });
}

/**
 * Resolves catalog image paths from the backend into a loadable URI.
 * Absolute URLs are returned unchanged unless they are TMDB URLs, which are normalized.
 * Relative paths use EXPO_PUBLIC_IMAGE_BASE_URL when set, otherwise the TMDB CDN.
 * TMDB paths always receive exactly one size segment regardless of base URL shape.
 */
export function resolveImageUri(
  path: string | null | undefined,
  size: ImageSize = 'w500',
): string | null {
  if (!path || path.trim().length === 0) {
    return null;
  }

  const trimmed = normalizeImagePathInput(path);

  if (/^https?:\/\//i.test(trimmed)) {
    const resolved = isTmdbUrl(trimmed)
      ? normalizeTmdbAbsoluteUrl(trimmed, size)
      : trimmed;
    logImageResolutionInDev(trimmed, resolved);
    return resolved;
  }

  const base = getEffectiveImageBase();

  let resolved: string;
  if (isTmdbBase(base)) {
    resolved = buildTmdbImageUrl(trimmed, size);
  } else {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    resolved = `${base}${normalizedPath}`;
  }

  logImageResolutionInDev(trimmed, resolved);
  return resolved;
}

export function resolveThumbnailImageUri(path: string | null | undefined): string | null {
  return resolveImageUri(path, 'w300');
}

export function resolveOriginalImageUri(path: string | null | undefined): string | null {
  return resolveImageUri(path, 'original');
}

/** TMDB provider logos are small; w92 matches TMDB's provider logo profile. */
export function resolveProviderLogoUri(path: string | null | undefined): string | null {
  return resolveImageUri(path, 'w92');
}
