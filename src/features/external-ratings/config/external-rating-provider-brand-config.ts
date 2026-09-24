import type { ImageSourcePropType } from 'react-native';
import {
  EXTERNAL_RATING_CARD_LOGO_VISUALS,
  EXTERNAL_RATING_RT_CARD_ICON_SIZE,
  type ExternalRatingCardProviderId,
} from './external-rating-card-visuals';

export type ExternalRatingProviderBrandId =
  | 'imdb'
  | 'letterboxd'
  | 'rotten-tomatoes'
  | 'metacritic'
  | 'tmdb';

export type ExternalRatingBrandVariant = 'default' | 'compact' | 'card';

export type ExternalRatingBrandSurface = 'dark' | 'light';

type ImageBrandConfig = {
  kind: 'image';
  source: ImageSourcePropType;
  height: number;
  aspectRatio: number;
  accessibilityLabel: string;
  surface: ExternalRatingBrandSurface;
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

const BRAND_DIMENSIONS: Record<Exclude<ExternalRatingBrandVariant, 'card'>, BrandDimensions> = {
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
      imdb: 16,
      letterboxd: 16,
      metacritic: 14,
      tmdb: 16,
    },
    rtIconSize: 15,
  },
};

type RasterBrandAsset = {
  wordmark: ImageSourcePropType;
  wordmarkAspectRatio: number;
  icon: ImageSourcePropType;
  iconAspectRatio: number;
  accessibilityLabel: string;
};

const BRAND_ASSETS: Record<
  Exclude<ExternalRatingProviderBrandId, 'rotten-tomatoes'>,
  RasterBrandAsset
> = {
  imdb: {
    wordmark: require('../../../../assets/external-ratings/imdb.png'),
    wordmarkAspectRatio: 575 / 289.83,
    icon: require('../../../../assets/external-ratings/imdb-icon.png'),
    iconAspectRatio: 1,
    accessibilityLabel: 'IMDb',
  },
  letterboxd: {
    wordmark: require('../../../../assets/external-ratings/letterboxd.png'),
    wordmarkAspectRatio: 512.093 / 54.024,
    icon: require('../../../../assets/external-ratings/letterboxd-icon.png'),
    iconAspectRatio: 1,
    accessibilityLabel: 'Letterboxd',
  },
  metacritic: {
    wordmark: require('../../../../assets/external-ratings/metacritic.png'),
    wordmarkAspectRatio: 176 / 40,
    icon: require('../../../../assets/external-ratings/metacritic-mark.png'),
    iconAspectRatio: 1,
    accessibilityLabel: 'Metacritic',
  },
  tmdb: {
    wordmark: require('../../../../assets/external-ratings/tmdb.png'),
    wordmarkAspectRatio: 185.04 / 133.4,
    icon: require('../../../../assets/external-ratings/tmdb-icon.png'),
    iconAspectRatio: 96 / 69,
    accessibilityLabel: 'TMDB',
  },
};

const ROTTEN_TOMATOES_ASSETS = {
  tomatometerIcon: require('../../../../assets/external-ratings/rt-tomatometer.png'),
  popcornIcon: require('../../../../assets/external-ratings/rt-popcorn.png'),
  accessibilityLabel: 'Rotten Tomatoes Tomatometer and Popcornmeter',
} as const;

function resolveRasterBrandForCard(
  brand: RasterBrandAsset,
  brandId: ExternalRatingCardProviderId,
): ImageBrandConfig {
  const visual = EXTERNAL_RATING_CARD_LOGO_VISUALS[brandId];
  const useIcon = visual.asset === 'icon';
  const height = visual.height * (visual.visualWeight ?? 1);

  return {
    kind: 'image',
    source: useIcon ? brand.icon : brand.wordmark,
    height,
    aspectRatio: useIcon ? brand.iconAspectRatio : brand.wordmarkAspectRatio,
    accessibilityLabel: brand.accessibilityLabel,
    surface: visual.surface,
  };
}

function resolveRasterBrand(
  brand: RasterBrandAsset,
  brandId: Exclude<ExternalRatingProviderBrandId, 'rotten-tomatoes'>,
  variant: Exclude<ExternalRatingBrandVariant, 'card'>,
): ImageBrandConfig {
  const dimensions = BRAND_DIMENSIONS[variant];
  const useIcon = variant === 'compact';

  return {
    kind: 'image',
    source: useIcon ? brand.icon : brand.wordmark,
    height: dimensions.imageHeights[brandId],
    aspectRatio: useIcon ? brand.iconAspectRatio : brand.wordmarkAspectRatio,
    accessibilityLabel: brand.accessibilityLabel,
    surface: 'dark',
  };
}

export function resolveExternalRatingProviderBrandConfig(
  source: string,
  variant: ExternalRatingBrandVariant = 'default',
): ExternalRatingProviderBrandConfig | null {
  if (variant === 'card') {
    if (source === 'imdb') {
      return resolveRasterBrandForCard(BRAND_ASSETS.imdb, 'imdb');
    }
    if (source === 'letterboxd') {
      return resolveRasterBrandForCard(BRAND_ASSETS.letterboxd, 'letterboxd');
    }
    if (source === 'metacritic') {
      return resolveRasterBrandForCard(BRAND_ASSETS.metacritic, 'metacritic');
    }
    if (source === 'tmdb') {
      return resolveRasterBrandForCard(BRAND_ASSETS.tmdb, 'tmdb');
    }
    if (source === 'rotten-tomatoes') {
      return {
        kind: 'rotten-tomatoes-icons',
        tomatometerIcon: ROTTEN_TOMATOES_ASSETS.tomatometerIcon,
        popcornIcon: ROTTEN_TOMATOES_ASSETS.popcornIcon,
        iconSize: EXTERNAL_RATING_RT_CARD_ICON_SIZE,
        accessibilityLabel: ROTTEN_TOMATOES_ASSETS.accessibilityLabel,
      };
    }
    return null;
  }

  const dimensions = BRAND_DIMENSIONS[variant];

  if (source === 'imdb') {
    return resolveRasterBrand(BRAND_ASSETS.imdb, 'imdb', variant);
  }

  if (source === 'letterboxd') {
    return resolveRasterBrand(BRAND_ASSETS.letterboxd, 'letterboxd', variant);
  }

  if (source === 'metacritic') {
    return resolveRasterBrand(BRAND_ASSETS.metacritic, 'metacritic', variant);
  }

  if (source === 'tmdb') {
    return resolveRasterBrand(BRAND_ASSETS.tmdb, 'tmdb', variant);
  }

  if (source === 'rotten-tomatoes') {
    return {
      kind: 'rotten-tomatoes-icons',
      tomatometerIcon: ROTTEN_TOMATOES_ASSETS.tomatometerIcon,
      popcornIcon: ROTTEN_TOMATOES_ASSETS.popcornIcon,
      iconSize: dimensions.rtIconSize,
      accessibilityLabel: ROTTEN_TOMATOES_ASSETS.accessibilityLabel,
    };
  }

  return null;
}

export function resolveRottenTomatoesCardIcons(): {
  tomatometerIcon: ImageSourcePropType;
  popcornIcon: ImageSourcePropType;
  iconSize: number;
} {
  return {
    tomatometerIcon: ROTTEN_TOMATOES_ASSETS.tomatometerIcon,
    popcornIcon: ROTTEN_TOMATOES_ASSETS.popcornIcon,
    iconSize: EXTERNAL_RATING_RT_CARD_ICON_SIZE,
  };
}
