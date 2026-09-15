import type { GalleryImageDto, GalleryResponse } from '../types';

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeGalleryImageDto(raw: unknown): GalleryImageDto {
  const image = (raw ?? {}) as Record<string, unknown>;

  return {
    filePath: String(image.filePath ?? image.FilePath ?? image.path ?? ''),
    language: (image.language ?? image.Language ?? null) as string | null,
    aspectRatio: (image.aspectRatio ?? image.AspectRatio ?? null) as number | null,
    width: (image.width ?? image.Width ?? null) as number | null,
    height: (image.height ?? image.Height ?? null) as number | null,
    voteAverage: Number(image.voteAverage ?? image.VoteAverage ?? 0),
    voteCount: Number(image.voteCount ?? image.VoteCount ?? 0),
  };
}

export function normalizeGalleryResponse(raw: unknown): GalleryResponse {
  const data = (raw ?? {}) as Record<string, unknown>;

  return {
    backdrops: readArray(data.backdrops ?? data.Backdrops).map(normalizeGalleryImageDto),
    posters: readArray(data.posters ?? data.Posters).map(normalizeGalleryImageDto),
    logos: readArray(data.logos ?? data.Logos).map(normalizeGalleryImageDto),
    profiles: readArray(data.profiles ?? data.Profiles).map(normalizeGalleryImageDto),
  };
}
