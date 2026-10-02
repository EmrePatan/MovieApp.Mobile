import type { HomeItem, HomeSection } from '../types';
import { prefetchCachedImages } from '@/utils/cached-image';
import {
  resolveHomeHeroNeighborPrefetchUris,
  resolveHomeRecommendedPrefetchUris,
} from './home-hero-image';

/**
 * Warm the on-screen hero posters plus one extra forward neighbor.
 * The centered URI is submitted first, then the left wrap, the next slide,
 * and the slide after that together. Heroes farther out are not prefetched.
 */
export function prefetchHomeHeroNeighbors(
  heroItems: readonly HomeItem[],
  activeIndex: number,
): void {
  const uris = resolveHomeHeroNeighborPrefetchUris(heroItems, activeIndex);
  if (uris.length === 0) {
    return;
  }

  prefetchCachedImages(uris.slice(0, 1));
  if (uris.length > 1) {
    prefetchCachedImages(uris.slice(1));
  }
}

/**
 * Warm the posters Home is about to show: the centered hero, the previous
 * hero (the last slide when the first is centered), the next hero, one extra
 * forward neighbor, then the first Recommended For You cards.
 * URIs come from the same builders the views use, and land in the expo-image
 * memory-disk cache those views read.
 */
export function prefetchHomeFeedImages(
  heroItems: readonly HomeItem[],
  sections: readonly HomeSection[],
): void {
  const recommended =
    sections.find((section) => section.type === 'RecommendedForYou')?.items ?? [];

  prefetchHomeHeroNeighbors(heroItems, 0);
  prefetchCachedImages(resolveHomeRecommendedPrefetchUris(recommended));
}
