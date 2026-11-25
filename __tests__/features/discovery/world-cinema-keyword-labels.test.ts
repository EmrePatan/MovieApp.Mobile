import {
  filterDraftToWorldCinemaPatch,
  worldCinemaStateToFilterDraft,
} from '@/features/discovery/utils/world-cinema-filter-adapters';
import {
  parseWorldCinemaParams,
  serializeWorldCinemaParams,
} from '@/features/discovery/utils/world-cinema-params';
import {
  filterDraftToStreamingPatch,
  streamingStateToFilterDraft,
} from '@/features/discovery/utils/streaming-filter-adapters';
import {
  parseStreamingDiscoverParams,
  serializeStreamingDiscoverParams,
} from '@/features/discovery/utils/streaming-discover-params';

describe('keyword names survive reopening the filter sheet', () => {
  it('keeps world cinema keyword labels through the URL and the sheet draft', () => {
    const state = parseWorldCinemaParams({
      keywords: '11,22',
      keywordLabels: JSON.stringify({ '11': 'Heist', '22': 'Zombie' }),
    });

    expect(state.keywordIds).toEqual(['11', '22']);
    expect(worldCinemaStateToFilterDraft(state).keywordLabels).toEqual({
      '11': 'Heist',
      '22': 'Zombie',
    });

    const params = serializeWorldCinemaParams(
      filterDraftToWorldCinemaPatch(worldCinemaStateToFilterDraft(state), state),
    );
    expect(parseWorldCinemaParams(params).keywordLabels).toEqual({ '11': 'Heist', '22': 'Zombie' });
  });

  it('drops labels for keywords that are no longer selected', () => {
    const state = parseWorldCinemaParams({
      keywords: '11',
      keywordLabels: JSON.stringify({ '11': 'Heist', '22': 'Zombie' }),
    });

    expect(serializeWorldCinemaParams(state).keywordLabels).toBe(JSON.stringify({ '11': 'Heist' }));
    expect(serializeWorldCinemaParams(parseWorldCinemaParams({})).keywordLabels).toBeUndefined();
  });

  it('keeps streaming keyword labels the same way', () => {
    const state = parseStreamingDiscoverParams({
      keywords: '11',
      keywordLabels: JSON.stringify({ '11': 'Heist' }),
    });

    expect(streamingStateToFilterDraft(state).keywordLabels).toEqual({ '11': 'Heist' });
    const params = serializeStreamingDiscoverParams(
      filterDraftToStreamingPatch(streamingStateToFilterDraft(state), state),
    );
    expect(params.keywordLabels).toBe(JSON.stringify({ '11': 'Heist' }));
  });
});

describe('world cinema sort', () => {
  it.each(['popularity_asc', 'rating_asc', 'title_asc', 'title_desc'] as const)(
    'accepts %s from the route',
    (sort) => {
      expect(parseWorldCinemaParams({ sort }).sort).toBe(sort);
    },
  );

  it('falls back to popularity for unknown values', () => {
    expect(parseWorldCinemaParams({ sort: 'nonsense' }).sort).toBe('popularity_desc');
  });
});
