import { resolveImageUri } from '@/utils/image-url';
import { rewriteLoopbackMediaUrl } from '@/utils/loopback-media-url';
import { colors } from '@/theme/colors';

export function resolveSocialProfileCoverUri(
  coverImageUrl: string | null | undefined,
  coverPosterPath: string | null | undefined,
  fallbackPosterPath: string | null | undefined,
): string | null {
  const customCover = rewriteLoopbackMediaUrl(coverImageUrl);
  if (customCover) return customCover;
  const poster = coverPosterPath?.trim() || fallbackPosterPath?.trim();
  return poster ? resolveImageUri(poster, 'w1280') : null;
}

export const SOCIAL_PROFILE_COVER_FALLBACK: [string, string, string] = [
  '#141018',
  colors.background,
  colors.background,
];