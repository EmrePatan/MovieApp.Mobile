import { movieQueryKey } from '@/features/details/movie/hooks/useMovieDetails';
import { tvShowQueryKey } from '@/features/details/tv/hooks/useTvShowDetails';
import { seasonQueryKey } from '@/features/details/season/hooks/useSeason';
import { episodeQueryKey } from '@/features/details/episode/hooks/useEpisode';

describe('details query keys', () => {
  const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  it('uses movie query key', () => {
    expect(movieQueryKey(id, 'en-US')).toEqual(['movie', id, 'en-US']);
  });

  it('uses tv show query key', () => {
    expect(tvShowQueryKey(id, 'tr-TR')).toEqual(['tvshow', id, 'tr-TR']);
  });

  it('uses season query key', () => {
    expect(seasonQueryKey(id, 2)).toEqual(['season', id, 2]);
  });

  it('uses episode query key', () => {
    expect(episodeQueryKey(id, 1, 3)).toEqual(['episode', id, 1, 3]);
  });
});
