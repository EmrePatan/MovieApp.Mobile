/**
 * Optional image base URL for backend-relative poster/backdrop/still paths.
 * The backend contract does not define a CDN base URL.
 * When unset, relative paths resolve to null and UI shows placeholders.
 */
export function getImageBaseUrl(): string | null {
  const base = process.env.EXPO_PUBLIC_IMAGE_BASE_URL?.trim();
  if (!base) {
    return null;
  }
  return base.replace(/\/+$/, '');
}

export type ImageSize = 'w300' | 'w500' | 'original';

function applyImageSize(baseUri: string, size: ImageSize): string {
  if (size === 'original') {
    return baseUri.replace(/\/w\d+\//, '/original/');
  }

  return baseUri.replace(/\/w\d+\//, `/${size}/`);
}

/**
 * Resolves catalog image paths from the backend into a loadable URI.
 * Absolute URLs are returned unchanged.
 * Relative paths require EXPO_PUBLIC_IMAGE_BASE_URL to be configured.
 */
export function resolveImageUri(
  path: string | null | undefined,
  size: ImageSize = 'w500',
): string | null {
  if (!path || path.trim().length === 0) {
    return null;
  }

  const trimmed = path.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = getImageBaseUrl();
  if (!base) {
    return null;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const uri = `${base}${normalizedPath}`;
  return applyImageSize(uri, size);
}

export function resolveThumbnailImageUri(path: string | null | undefined): string | null {
  return resolveImageUri(path, 'w300');
}

export function resolveOriginalImageUri(path: string | null | undefined): string | null {
  return resolveImageUri(path, 'original');
}
