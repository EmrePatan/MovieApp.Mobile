import { getWatchStatusBatch } from '../api/watch-history-api';
import type {
  MovieWatchStatusResponse,
  TvShowWatchStatusBatchItem,
  WatchStatusBatchRequest,
  WatchStatusBatchResponse,
} from '../types';

/** Calls made inside this window share one request. */
export const WATCH_STATUS_BATCH_WINDOW_MS = 30;
/** Mirrors the server limit per kind (WatchStatusBatchService.MaxIdsPerKind). */
export const WATCH_STATUS_BATCH_MAX_IDS = 100;

type FetchBatch = (
  request: WatchStatusBatchRequest,
  signal?: AbortSignal,
) => Promise<WatchStatusBatchResponse>;

interface Waiter<T> {
  settled: boolean;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function createAbortError(): Error {
  const error = new Error('The watch status request was aborted.');
  error.name = 'AbortError';
  return error;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export interface WatchStatusBatcher {
  loadMovie(movieId: string, signal?: AbortSignal): Promise<MovieWatchStatusResponse>;
  loadTvShow(tvShowId: string, signal?: AbortSignal): Promise<TvShowWatchStatusBatchItem>;
}

/**
 * Collects per-poster status lookups made in the same tick window and sends them as one
 * request, so a screen full of cards costs one round trip instead of one per card.
 * Each caller still gets its own promise, so react-query keys, caching and abort handling
 * stay per item.
 */
export function createWatchStatusBatcher(
  fetchBatch: FetchBatch = getWatchStatusBatch,
  windowMs = WATCH_STATUS_BATCH_WINDOW_MS,
): WatchStatusBatcher {
  let movies = new Map<string, Waiter<MovieWatchStatusResponse>[]>();
  let tvShows = new Map<string, Waiter<TvShowWatchStatusBatchItem>[]>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  function liveIds<T>(pending: Map<string, Waiter<T>[]>): string[] {
    return [...pending.entries()]
      .filter(([, waiters]) => waiters.some((waiter) => !waiter.settled))
      .map(([id]) => id);
  }

  function settle<T>(waiters: Waiter<T>[] | undefined, action: (waiter: Waiter<T>) => void) {
    for (const waiter of waiters ?? []) {
      if (!waiter.settled) {
        waiter.settled = true;
        action(waiter);
      }
    }
  }

  async function sendChunk(
    movieIds: string[],
    tvShowIds: string[],
    movieWaiters: Map<string, Waiter<MovieWatchStatusResponse>[]>,
    tvWaiters: Map<string, Waiter<TvShowWatchStatusBatchItem>[]>,
  ) {
    try {
      const response = await fetchBatch({ movieIds, tvShowIds });
      const movieById = new Map((response.movies ?? []).map((movie) => [movie.movieId, movie]));
      const tvById = new Map((response.tvShows ?? []).map((show) => [show.tvShowId, show]));

      for (const movieId of movieIds) {
        const result = movieById.get(movieId) ?? { movieId, isWatched: false, watchedAt: null };
        settle(movieWaiters.get(movieId), (waiter) => waiter.resolve(result));
      }

      for (const tvShowId of tvShowIds) {
        const result = tvById.get(tvShowId) ?? {
          tvShowId,
          isFullyWatched: false,
          regularTotalEpisodes: 0,
          regularWatchedEpisodes: 0,
        };
        settle(tvWaiters.get(tvShowId), (waiter) => waiter.resolve(result));
      }
    } catch (error) {
      for (const movieId of movieIds) {
        settle(movieWaiters.get(movieId), (waiter) => waiter.reject(error));
      }
      for (const tvShowId of tvShowIds) {
        settle(tvWaiters.get(tvShowId), (waiter) => waiter.reject(error));
      }
    }
  }

  function flush() {
    timer = null;
    const pendingMovies = movies;
    const pendingTvShows = tvShows;
    movies = new Map();
    tvShows = new Map();

    const movieChunks = chunk(liveIds(pendingMovies), WATCH_STATUS_BATCH_MAX_IDS);
    const tvChunks = chunk(liveIds(pendingTvShows), WATCH_STATUS_BATCH_MAX_IDS);
    const requestCount = Math.max(movieChunks.length, tvChunks.length);

    for (let index = 0; index < requestCount; index += 1) {
      void sendChunk(
        movieChunks[index] ?? [],
        tvChunks[index] ?? [],
        pendingMovies,
        pendingTvShows,
      );
    }
  }

  function schedule() {
    if (timer === null) {
      timer = setTimeout(flush, windowMs);
    }
  }

  function enqueue<T>(
    pending: Map<string, Waiter<T>[]>,
    id: string,
    signal: AbortSignal | undefined,
  ): Promise<T> {
    if (signal?.aborted) {
      return Promise.reject(createAbortError());
    }

    return new Promise<T>((resolve, reject) => {
      const waiter: Waiter<T> = { settled: false, resolve, reject };
      const waiters = pending.get(id);
      if (waiters) {
        waiters.push(waiter);
      } else {
        pending.set(id, [waiter]);
      }

      signal?.addEventListener(
        'abort',
        () => {
          if (!waiter.settled) {
            waiter.settled = true;
            reject(createAbortError());
          }
        },
        { once: true },
      );

      schedule();
    });
  }

  return {
    loadMovie: (movieId, signal) => enqueue(movies, movieId, signal),
    loadTvShow: (tvShowId, signal) => enqueue(tvShows, tvShowId, signal),
  };
}

const sharedBatcher = createWatchStatusBatcher();

export function loadBatchedMovieWatchStatus(movieId: string, signal?: AbortSignal) {
  return sharedBatcher.loadMovie(movieId, signal);
}

export function loadBatchedTvShowWatchStatus(tvShowId: string, signal?: AbortSignal) {
  return sharedBatcher.loadTvShow(tvShowId, signal);
}
