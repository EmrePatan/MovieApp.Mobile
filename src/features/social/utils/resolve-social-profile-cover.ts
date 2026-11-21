import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';

export function resolveSocialProfileCoverUri(
  coverImageUrl: string | null | undefined,
  coverPosterPath: string | null | undefined,
  fallbackPosterPath: string | null | undefined,
): string | null {
  if (coverImageUrl?.trim()) return coverImageUrl.trim();
  const poster = coverPosterPath?.trim() || fallbackPosterPath?.trim();
  return poster ? resolveImageUri(poster, 'w1280') : null;
}

export const SOCIAL_PROFILE_COVER_FALLBACK: [string, string, string] = [
  '#141018',
  colors.background,
  colors.background,
];