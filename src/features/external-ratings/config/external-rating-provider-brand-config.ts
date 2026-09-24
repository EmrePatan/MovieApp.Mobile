import type { ImageSourcePropType } from 'react-native';

export type ExternalRatingProviderBrandId =
  | 'imdb'
  | 'letterboxd'
  | 'rotten-tomatoes'
  | 'metacritic'
  | 'tmdb';

type SvgBrandConfig = {
  kind: 'svg';
  svgKey: 'imdb' | 'letterboxd' | 'metacritic' | 'tmdb';
  height: number;
  aspectRatio: number;
  accessibilityLabel: string;
};

type RottenTomatoesBrandConfig = {
  kind: 'rotten-tomatoes-icons';
  tomatometerIcon: ImageSourcePropType;
  popcornIcon: ImageSourcePropType;
  iconSize: number;
  accessibilityLabel: string;
};

export type ExternalRatingProviderBrandConfig = SvgBrandConfig | RottenTomatoesBrandConfig;

export const EXTERNAL_RATING_PROVIDER_BRAND_CONFIG: Record<
  ExternalRatingProviderBrandId,
  ExternalRatingProviderBrandConfig
> = {
  imdb: {
    kind: 'svg',
    svgKey: 'imdb',
    height: 18,
    aspectRatio: 575 / 289.83,
    accessibilityLabel: 'IMDb',
  },
  letterboxd: {
    kind: 'svg',
    svgKey: 'letterboxd',
    height: 16,
    aspectRatio: 512.093 / 54.024,
    accessibilityLabel: 'Letterboxd',
  },
  metacritic: {
    kind: 'svg',
    svgKey: 'metacritic',
    height: 18,
    aspectRatio: 4.5,
    accessibilityLabel: 'Metacritic',
  },
  tmdb: {
    kind: 'svg',
    svgKey: 'tmdb',
    height: 22,
    aspectRatio: 512 / 369,
    accessibilityLabel: 'TMDB',
  },
  'rotten-tomatoes': {
    kind: 'rotten-tomatoes-icons',
    tomatometerIcon: require('../../../../assets/external-ratings/rt-tomatometer.png'),
    popcornIcon: require('../../../../assets/external-ratings/rt-popcorn.png'),
    iconSize: 20,
    accessibilityLabel: 'Rotten Tomatoes Tomatometer and Popcornmeter',
  },
};

export function resolveExternalRatingProviderBrandConfig(
  source: string,
): ExternalRatingProviderBrandConfig | null {
  if (source in EXTERNAL_RATING_PROVIDER_BRAND_CONFIG) {
    return EXTERNAL_RATING_PROVIDER_BRAND_CONFIG[source as ExternalRatingProviderBrandId];
  }

  return null;
}
