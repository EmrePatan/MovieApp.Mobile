import { isValidTrailerWatchUrl } from '../utils/validate-trailer-watch-url';
import { useMovieVideos, useTvShowVideos } from './useVideos';

interface DetailTrailerSource {
  contentType: 'movie' | 'tv';
  contentId: string;
}

export function useDetailTrailerWatchUrl({ contentType, contentId }: DetailTrailerSource) {
  const movieQuery = useMovieVideos(contentType === 'movie' ? contentId : '');
  const tvQuery = useTvShowVideos(contentType === 'tv' ? contentId : '');
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  const watchUrl = query.data?.primary?.watchUrl;
  const hasTrailer =
    !query.isLoading
    && !query.isError
    && typeof watchUrl === 'string'
    && isValidTrailerWatchUrl(watchUrl);

  return {
    watchUrl: hasTrailer ? watchUrl : null,
    isLoading: query.isLoading,
  };
}
