import type { HomeItem, HomeSection } from '../types';
import { prefetchCachedImages } from '@/utils/cached-image';
import {
  resolveHomeHeroNeighborPrefetchUris,
  resolveHomeRecommendedPrefetchUris,
} from './home-hero-image';

/**
 * Warm the posters Home is about to show: the visible hero, the next hero
 * (wrapping), and the first Recommended For You cards.
 * URIs come from the same builders the views use, and land in the expo-image
 * memory-disk cache those views read.
 */
export function prefetchHomeFeedImages(
  heroItems: readonly HomeItem[],
  sections: readonly HomeSection[],
): void {
  const recommended =
    sections.find((section) => section.type === 'RecommendedForYou')?.items ?? [];

  prefetchCachedImages([
    ...resolveHomeHeroNeighborPrefetchUris(heroItems, 0),
    ...resolveHomeRecommendedPrefetchUris(recommended),
  ]);
}
