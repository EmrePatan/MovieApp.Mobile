export interface UserReviewListItem {
  id: string;
  contentType: 'movie' | 'tv';
  contentId: string;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  userRating: number | null;
}

export interface UserReviewListResponse {
  items: UserReviewListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const DEFAULT_MY_COMMENTS_PAGE_SIZE = 15;
