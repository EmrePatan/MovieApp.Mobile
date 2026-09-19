import { i18n } from '@/i18n';
import type { ReviewSortOption } from '../types';

export const REVIEW_SORT_OPTIONS: ReviewSortOption[] = [
  'newest',
  'oldest',
  'ratingDesc',
  'ratingAsc',
];

export function getReviewSortLabel(option: ReviewSortOption): string {
  return i18n.t(`reviews.sort.${option}`);
}
