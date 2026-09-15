export type LibraryCollectionStatus = 'watching' | 'completed' | 'saved' | 'watched';

export interface LibraryStatusPresentation {
  status: LibraryCollectionStatus;
  label: string;
  detail?: string | null;
  progressPercentage?: number | null;
}
