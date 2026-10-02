import { Image } from 'react-native';
import type { HomeItem, HomeSection } from '../types';
import {
  resolveHomeHeroNeighborPrefetchUris,
  resolveHomeRecommendedPrefetchUris,
} from './home-hero-image';

/**
 * Warm the posters Home is about to show: the visible hero, the next hero
 * (wrapping), and the first Recommended For You cards.
 */
export function prefetchHomeFeedImages(
  heroItems: readonly HomeItem[],
  sections: readonly HomeSection[],
): void {
  const recommended =
    sections.find((section) => section.type === 'RecommendedForYou')?.items ?? [];
  const uris = [
    ...resolveHomeHeroNeighborPrefetchUris(heroItems, 0),
    ...resolveHomeRecommendedPrefetchUris(recommended),
  ];

  for (const uri of uris) {
    void Image.prefetch(uri);
  }
}
