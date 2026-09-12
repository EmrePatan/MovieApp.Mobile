import {
  buildAutocompletePath,
  buildClearSearchHistoryPath,
  buildDeleteSearchHistoryItemPath,
  buildSearchHistoryPath,
  buildSearchPath,
} from '@/features/search/api/routes';
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  getAutocomplete,
  getSearchHistory,
  search,
} from '@/features/search/api/search-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('search api routes', () => {
  it('builds search path with query, type, and pagination', () => {
    expect(
      buildSearchPath({
        q: 'interstellar',
        type: 'movie',
        page: 2,
        pageSize: 20,
      }),
    ).toBe('/api/search?q=interstellar&type=movie&page=2&pageSize=20');
  });

  it('builds autocomplete path', () => {
    expect(buildAutocompletePath('break')).toBe('/api/search/autocomplete?q=break');
  });

  it('builds search history paths', () => {
    expect(buildSearchHistoryPath(1, 20)).toBe('/api/search/history?page=1&pageSize=20');
    expect(buildDeleteSearchHistoryItemPath('history-id')).toBe(
      '/api/search/history/history-id',
    );
    expect(buildClearSearchHistoryPath()).toBe('/api/search/history');
  });
});

describe('search api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('searches through the central api client without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [], page: 1, pageSize: 20 });
    await search({ q: 'matrix', type: 'all', page: 1, pageSize: 20 });
    expect(api.get).toHaveBeenCalledWith('/api/search?q=matrix&type=all&page=1&pageSize=20', {
      authenticated: false,
      signal: undefined,
    });
  });

  it('loads autocomplete without auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    await getAutocomplete('matrix');
    expect(api.get).toHaveBeenCalledWith('/api/search/autocomplete?q=matrix', {
      authenticated: false,
      signal: undefined,
    });
  });

  it('loads and deletes search history with auth', async () => {
    (api.get as jest.Mock).mockResolvedValue({ items: [] });
    (api.delete as jest.Mock).mockResolvedValue(undefined);

    await getSearchHistory(1, 20);
    await deleteSearchHistoryItem('history-id');
    await clearSearchHistory();

    expect(api.get).toHaveBeenCalledWith('/api/search/history?page=1&pageSize=20', {
      signal: undefined,
    });
    expect(api.delete).toHaveBeenCalledWith('/api/search/history/history-id');
    expect(api.delete).toHaveBeenCalledWith('/api/search/history');
  });
});
