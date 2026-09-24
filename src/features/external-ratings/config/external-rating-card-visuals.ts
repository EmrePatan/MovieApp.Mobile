export type ExternalRatingBrandSurface = 'dark' | 'light';

export type ExternalRatingCardProviderId = 'imdb' | 'letterboxd' | 'metacritic' | 'tmdb';

export type ExternalRatingCardLogoAsset = 'wordmark' | 'icon';

export interface ExternalRatingCardLogoVisual {
  asset: ExternalRatingCardLogoAsset;
  /** Rendered logo height in px; width follows aspect ratio. */
  height: number;
  /** Perceived-size multiplier for normalization (optional fine-tuning). */
  visualWeight?: number;
  surface: ExternalRatingBrandSurface;
}

export const EXTERNAL_RATING_CARD_LOGO_VISUALS: Record<
  ExternalRatingCardProviderId,
  ExternalRatingCardLogoVisual
> = {
  imdb: {
    asset: 'icon',
    height: 20,
    surface: 'dark',
  },
  letterboxd: {
    asset: 'icon',
    height: 20,
    surface: 'dark',
  },
  metacritic: {
    asset: 'icon',
    height: 20,
    surface: 'dark',
  },
  tmdb: {
    asset: 'icon',
    height: 20,
    surface: 'dark',
  },
};

export const EXTERNAL_RATING_RT_CARD_ICON_SIZE = 20;

export const EXTERNAL_RATING_CARD_LAYOUT = {
  minHeight: 44,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
  brandScoreGap: 10,
  scoreFontSize: 13,
  rtPairGap: 4,
  rtGroupsGap: 10,
} as const;
