import {
  createWatchStatusBatcher,
  WATCH_STATUS_BATCH_MAX_IDS,
  WATCH_STATUS_BATCH_WINDOW_MS,
} from '@/features/watch-history/utils/watch-status-batcher';
import type {
  WatchStatusBatchRequest,
  WatchStatusBatchResponse,
} from '@/features/watch-history/types';

jest.mock('@/features/watch-history/api/watch-history-api', () => ({
  getWatchStatusBatch: jest.fn(),
}));

function respondWith(
  request: WatchStatusBatchRequest,
  watchedMovies: string[] = [],
  fullyWatchedShows: string[] = [],
): WatchStatusBatchResponse {
  return {
    movies: request.movieIds.map((movieId) => ({
      movieId,
      isWatched: watchedMovies.includes(movieId),
      watchedAt: watchedMovies.includes(movieId) ? '2026-11-20T10:00:00Z' : null,
    })),
    tvShows: request.tvShowIds.map((tvShowId) => ({
      tvShowId,
      isFullyWatched: fullyWatchedShows.includes(tvShowId),
      regularTotalEpisodes: 10,
      regularWatchedEpisodes: fullyWatchedShows.includes(tvShowId) ? 10 : 3,
    })),
  };
}

describe('watch status batcher', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends one request for every lookup made inside the window', async () => {
    const fetchBatch = jest.fn(async (request: WatchStatusBatchRequest) =>
      respondWith(request, ['m2'], ['t1']),
    );
    const batcher = createWatchStatusBatcher(fetchBatch);

    const results = Promise.all([
      batcher.loadMovie('m1'),
      batcher.loadMovie('m2'),
      batcher.loadTvShow('t1'),
      batcher.loadTvShow('t2'),
    ]);

    expect(fetchBatch).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    const [m1, m2, t1, t2] = await results;

    expect(fetchBatch).toHaveBeenCalledTimes(1);
    expect(fetchBatch).toHaveBeenCalledWith({ movieIds: ['m1', 'm2'], tvShowIds: ['t1', 't2'] });
    expect(m1.isWatched).toBe(false);
    expect(m2.isWatched).toBe(true);
    expect(t1.isFullyWatched).toBe(true);
    expect(t2.isFullyWatched).toBe(false);
  });

  it('shares one id between callers that ask for the same item', async () => {
    const fetchBatch = jest.fn(async (request: WatchStatusBatchRequest) =>
      respondWith(request, ['m1']),
    );
    const batcher = createWatchStatusBatcher(fetchBatch);

    const first = batcher.loadMovie('m1');
    const second = batcher.loadMovie('m1');
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);

    expect((await first).isWatched).toBe(true);
    expect((await second).isWatched).toBe(true);
    expect(fetchBatch).toHaveBeenCalledWith({ movieIds: ['m1'], tvShowIds: [] });
  });

  it('starts a new request for lookups made after the window closed', async () => {
    const fetchBatch = jest.fn(async (request: WatchStatusBatchRequest) => respondWith(request));
    const batcher = createWatchStatusBatcher(fetchBatch);

    const first = batcher.loadMovie('m1');
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    await first;

    const second = batcher.loadMovie('m2');
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    await second;

    expect(fetchBatch).toHaveBeenCalledTimes(2);
  });

  it('splits requests larger than the server limit', async () => {
    const fetchBatch = jest.fn(async (request: WatchStatusBatchRequest) => respondWith(request));
    const batcher = createWatchStatusBatcher(fetchBatch);
    const ids = Array.from({ length: WATCH_STATUS_BATCH_MAX_IDS + 5 }, (_, index) => `m${index}`);

    const results = Promise.all(ids.map((id) => batcher.loadMovie(id)));
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    await results;

    expect(fetchBatch).toHaveBeenCalledTimes(2);
    expect(fetchBatch.mock.calls[0][0].movieIds).toHaveLength(WATCH_STATUS_BATCH_MAX_IDS);
    expect(fetchBatch.mock.calls[1][0].movieIds).toHaveLength(5);
  });

  it('treats ids missing from the response as not watched', async () => {
    const fetchBatch = jest.fn(async () => ({ movies: [], tvShows: [] }));
    const batcher = createWatchStatusBatcher(fetchBatch);

    const movie = batcher.loadMovie('m1');
    const show = batcher.loadTvShow('t1');
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);

    expect(await movie).toEqual({ movieId: 'm1', isWatched: false, watchedAt: null });
    expect((await show).isFullyWatched).toBe(false);
  });

  it('rejects every waiter of a failed request and recovers for the next one', async () => {
    const fetchBatch = jest
      .fn<Promise<WatchStatusBatchResponse>, [WatchStatusBatchRequest]>()
      .mockRejectedValueOnce(new Error('network down'))
      .mockImplementation(async (request) => respondWith(request, ['m1']));
    const batcher = createWatchStatusBatcher(fetchBatch);

    const failing = batcher.loadMovie('m1');
    const failingToo = batcher.loadTvShow('t1');
    const assertions = Promise.all([
      expect(failing).rejects.toThrow('network down'),
      expect(failingToo).rejects.toThrow('network down'),
    ]);
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    await assertions;

    const recovered = batcher.loadMovie('m1');
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    expect((await recovered).isWatched).toBe(true);
  });

  it('drops aborted lookups before sending and keeps the others', async () => {
    const fetchBatch = jest.fn(async (request: WatchStatusBatchRequest) => respondWith(request));
    const batcher = createWatchStatusBatcher(fetchBatch);
    const controller = new AbortController();

    const aborted = batcher.loadMovie('m1', controller.signal);
    const kept = batcher.loadMovie('m2');
    const abortedAssertion = expect(aborted).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await abortedAssertion;

    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    await kept;

    expect(fetchBatch).toHaveBeenCalledWith({ movieIds: ['m2'], tvShowIds: [] });
  });

  it('rejects immediately when the signal is already aborted', async () => {
    const fetchBatch = jest.fn();
    const batcher = createWatchStatusBatcher(fetchBatch);
    const controller = new AbortController();
    controller.abort();

    await expect(batcher.loadMovie('m1', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    await jest.advanceTimersByTimeAsync(WATCH_STATUS_BATCH_WINDOW_MS);
    expect(fetchBatch).not.toHaveBeenCalled();
  });
});
