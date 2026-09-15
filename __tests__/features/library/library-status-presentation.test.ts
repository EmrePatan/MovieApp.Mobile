import {
  buildLibraryGridAccessibilityLabel,
  resolveLibraryStatusPresentation,
} from '@/features/library/utils/library-status-presentation';
import type { LibraryItem } from '@/features/library/types/library';

function createItem(collectionStatus: LibraryItem['collectionStatus']): LibraryItem {
  return {
    id: 'item-1',
    type: 'tv',
    title: 'Sample Show',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    year: 2024,
    voteAverage: 8,
    addedAt: null,
    watchedAt: null,
    lastActivityAt: null,
    progressPercentage: 50,
    nextEpisode: {
      episodeId: 'ep-1',
      seasonNumber: 1,
      episodeNumber: 2,
      title: 'Next',
    },
    collectionStatus,
  };
}

describe('resolveLibraryStatusPresentation', () => {
  it('maps watching items with progress and next episode', () => {
    const presentation = resolveLibraryStatusPresentation(createItem('watching'));

    expect(presentation.status).toBe('watching');
    expect(presentation.label).toBe('Watching');
    expect(presentation.detail).toBe('S1 · E2 · Next');
    expect(presentation.progressPercentage).toBe(50);
  });

  it('maps watched items to watched status', () => {
    const presentation = resolveLibraryStatusPresentation(createItem('watched'));

    expect(presentation.status).toBe('watched');
    expect(presentation.label).toBe('Watched');
  });

  it('maps liked items to liked status', () => {
    const presentation = resolveLibraryStatusPresentation(createItem('liked'));

    expect(presentation.status).toBe('liked');
    expect(presentation.label).toBe('Liked');
  });

  it('maps watchlist items to saved status', () => {
    const presentation = resolveLibraryStatusPresentation(createItem('watchlist'));

    expect(presentation.status).toBe('saved');
    expect(presentation.label).toBe('Watchlist');
  });
});

describe('buildLibraryGridAccessibilityLabel', () => {
  it('includes progress context for watching items without repeating category text in visible UI', () => {
    const item = createItem('watching');
    const presentation = resolveLibraryStatusPresentation(item);

    expect(
      buildLibraryGridAccessibilityLabel(item, presentation, 'watching'),
    ).toBe('Sample Show, S1 · E2 · Next, 50% watched');
  });

  it('preserves semantic labels for compact category views', () => {
    const item = createItem('liked');
    const presentation = resolveLibraryStatusPresentation(item);

    expect(buildLibraryGridAccessibilityLabel(item, presentation, 'liked')).toBe(
      'Sample Show, Liked',
    );
  });
});
