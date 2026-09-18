import type { ReviewSortOption } from '../types';

export const REVIEW_SORT_OPTIONS: ReviewSortOption[] = [
  'newest',
  'oldest',
  'ratingDesc',
  'ratingAsc',
];

export function getReviewSortLabel(option: ReviewSortOption): string {
  switch (option) {
    case 'newest':
      return 'Newest';
    case 'oldest':
      return 'Oldest';
    case 'ratingDesc':
      return 'Highest rated';
    case 'ratingAsc':
      return 'Lowest rated';
    default:
      return option;
  }
}
