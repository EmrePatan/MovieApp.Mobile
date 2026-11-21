export type BrowseQuickActionsMediaType = 'movie' | 'tv';

export interface BrowseQuickActionsTarget {
  contentId: string;
  contentType: BrowseQuickActionsMediaType;
  title: string;
  posterUrl: string | null;
  /** Catalog year when available — shown in the quick-actions sheet header. */
  year?: number | null;
  releaseDate?: string | null;
  /** Community rating when available — shown in the quick-actions sheet header. */
  voteAverage?: number | null;
}
