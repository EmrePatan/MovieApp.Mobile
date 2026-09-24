import type { ImageSourcePropType } from 'react-native';

export type ExternalRatingProviderBrandId =
  | 'imdb'
  | 'letterboxd'
  | 'rotten-tomatoes'
  | 'metacritic'
  | 'tmdb';

type ImageBrandConfig = {
  kind: 'image';
  source: ImageSourcePropType;
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

export type ExternalRatingProviderBrandConfig = ImageBrandConfig | RottenTomatoesBrandConfig;

export const EXTERNAL_RATING_PROVIDER_BRAND_CONFIG: Record<
  ExternalRatingProviderBrandId,
  ExternalRatingProviderBrandConfig
> = {
  imdb: {
    kind: 'image',
    source: require('../../../../assets/external-ratings/imdb.png'),
    height: 18,
    aspectRatio: 575 / 289.83,
    accessibilityLabel: 'IMDb',
  },
  letterboxd: {
    kind: 'image',
    source: require('../../../../assets/external-ratings/letterboxd.png'),
    height: 16,
    aspectRatio: 512.093 / 54.024,
    accessibilityLabel: 'Letterboxd',
  },
  metacritic: {
    kind: 'image',
    source: require('../../../../assets/external-ratings/metacritic.png'),
    height: 18,
    aspectRatio: 176 / 40,
    accessibilityLabel: 'Metacritic',
  },
  tmdb: {
    kind: 'image',
    source: require('../../../../assets/external-ratings/tmdb.png'),
    height: 22,
    aspectRatio: 185.04 / 133.4,
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
