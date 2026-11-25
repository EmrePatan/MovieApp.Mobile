import { CatalogImage } from '@/features/details/shared/components/CatalogImage';

export const SOCIAL_FEED_POSTER_W = 64;
export const SOCIAL_FEED_POSTER_H = 96;

interface SocialFeedPosterThumbProps {
  posterPath: string | null | undefined;
  title: string;
}

export function SocialFeedPosterThumb({ posterPath, title }: SocialFeedPosterThumbProps) {
  return (
    <CatalogImage
      path={posterPath}
      width={SOCIAL_FEED_POSTER_W}
      height={SOCIAL_FEED_POSTER_H}
      accessibilityLabel={title}
    />
  );
}