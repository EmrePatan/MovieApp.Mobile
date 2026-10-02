import { Image, type ImageProps } from 'expo-image';

/**
 * Decoded posters stay in memory and fall back to disk.
 * `Image.prefetch` must use this same policy: React Native's `Image.prefetch`
 * fills a different cache, so the view still waits on its own request and
 * `onLoad` before anything is painted.
 */
export const REMOTE_IMAGE_CACHE_POLICY = 'memory-disk' as const;

export type RemoteImagePriority = NonNullable<ImageProps['priority']>;

/** Warm the exact URIs the image views will request. Duplicate URLs are skipped. */
export function prefetchCachedImages(uris: readonly (string | null | undefined)[]): void {
  const unique: string[] = [];

  for (const uri of uris) {
    if (uri != null && uri.length > 0 && !unique.includes(uri)) {
      unique.push(uri);
    }
  }

  if (unique.length === 0) {
    return;
  }

  void Image.prefetch(unique, { cachePolicy: REMOTE_IMAGE_CACHE_POLICY });
}
