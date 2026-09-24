import type { ImageSourcePropType } from 'react-native';

export type ExternalRatingProviderBrandId =
  | 'imdb'
  | 'letterboxd'
  | 'rotten-tomatoes'
  | 'metacritic'
  | 'tmdb';

export type ExternalRatingBrandVariant = 'default' | 'compact';

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

type BrandDimensions = {
  imageHeights: Record<Exclude<ExternalRatingProviderBrandId, 'rotten-tomatoes'>, number>;
  rtIconSize: number;
};

const BRAND_DIMENSIONS: Record<ExternalRatingBrandVariant, BrandDimensions> = {
  default: {
    imageHeights: {
      imdb: 18,
      letterboxd: 16,
      metacritic: 18,
      tmdb: 22,
    },
    rtIconSize: 20,
  },
  compact: {
    imageHeights: {
      imdb: 13,
      letterboxd: 12,
      metacritic: 13,
      tmdb: 15,
    },
    rtIconSize: 15,
  },
};

const BRAND_ASSETS = {
  imdb: {
    source: require('../../../../assets/external-ratings/imdb.png'),
    aspectRatio: 575 / 289.83,
    accessibilityLabel: 'IMDb',
  },
  letterboxd: {
    source: require('../../../../assets/external-ratings/letterboxd.png'),
    aspectRatio: 512.093 / 54.024,
    accessibilityLabel: 'Letterboxd',
  },
  metacritic: {
    source: require('../../../../assets/external-ratings/metacritic.png'),
    aspectRatio: 176 / 40,
    accessibilityLabel: 'Metacritic',
  },
  tmdb: {
    source: require('../../../../assets/external-ratings/tmdb.png'),
    aspectRatio: 185.04 / 133.4,
    accessibilityLabel: 'TMDB',
  },
  'rotten-tomatoes': {
    tomatometerIcon: require('../../../../assets/external-ratings/rt-tomatometer.png'),
    popcornIcon: require('../../../../assets/external-ratings/rt-popcorn.png'),
    accessibilityLabel: 'Rotten Tomatoes Tomatometer and Popcornmeter',
  },
} as const;

export function resolveExternalRatingProviderBrandConfig(
  source: string,
  variant: ExternalRatingBrandVariant = 'default',
): ExternalRatingProviderBrandConfig | null {
  const dimensions = BRAND_DIMENSIONS[variant];

  if (source === 'imdb') {
    return {
      kind: 'image',
      source: BRAND_ASSETS.imdb.source,
      height: dimensions.imageHeights.imdb,
      aspectRatio: BRAND_ASSETS.imdb.aspectRatio,
      accessibilityLabel: BRAND_ASSETS.imdb.accessibilityLabel,
    };
  }

  if (source === 'letterboxd') {
    return {
      kind: 'image',
      source: BRAND_ASSETS.letterboxd.source,
      height: dimensions.imageHeights.letterboxd,
      aspectRatio: BRAND_ASSETS.letterboxd.aspectRatio,
      accessibilityLabel: BRAND_ASSETS.letterboxd.accessibilityLabel,
    };
  }

  if (source === 'metacritic') {
    return {
      kind: 'image',
      source: BRAND_ASSETS.metacritic.source,
      height: dimensions.imageHeights.metacritic,
      aspectRatio: BRAND_ASSETS.metacritic.aspectRatio,
      accessibilityLabel: BRAND_ASSETS.metacritic.accessibilityLabel,
    };
  }

  if (source === 'tmdb') {
    return {
      kind: 'image',
      source: BRAND_ASSETS.tmdb.source,
      height: dimensions.imageHeights.tmdb,
      aspectRatio: BRAND_ASSETS.tmdb.aspectRatio,
      accessibilityLabel: BRAND_ASSETS.tmdb.accessibilityLabel,
    };
  }

  if (source === 'rotten-tomatoes') {
    return {
      kind: 'rotten-tomatoes-icons',
      tomatometerIcon: BRAND_ASSETS['rotten-tomatoes'].tomatometerIcon,
      popcornIcon: BRAND_ASSETS['rotten-tomatoes'].popcornIcon,
      iconSize: dimensions.rtIconSize,
      accessibilityLabel: BRAND_ASSETS['rotten-tomatoes'].accessibilityLabel,
    };
  }

  return null;
}
