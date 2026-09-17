import {
  buildHomeQueryString,
  getHome,
  getHomeBrowse,
  getHomePersonalized,
} from '@/features/home/api/home-api';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('home api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds the correct query string with defaults', () => {
    expect(buildHomeQueryString()).toBe('type=all&sectionSize=10');
  });

  it('builds the correct query string for movie filter', () => {
    expect(buildHomeQueryString({ type: 'movie', sectionSize: 10 })).toBe(
      'type=movie&sectionSize=10',
    );
  });

  it('requests home data through the central API client', async () => {
    const response = {
      sections: [],
      isPersonalized: false,
    };

    (api.get as jest.Mock).mockResolvedValue(response);

    const controller = new AbortController();
    const result = await getHome({ type: 'tv', sectionSize: 10 }, controller.signal);

    expect(api.get).toHaveBeenCalledWith('/api/home?type=tv&sectionSize=10', {
      signal: controller.signal,
    });
    expect(result).toEqual(response);
  });

  it('requests browse data through the central API client', async () => {
    const response = {
      sections: [],
      generatedAtUtc: '2026-01-01T00:00:00Z',
    };

    (api.get as jest.Mock).mockResolvedValue(response);

    const result = await getHomeBrowse({ type: 'all', sectionSize: 10 });

    expect(api.get).toHaveBeenCalledWith('/api/home/browse?type=all&sectionSize=10', {
      signal: undefined,
      headers: undefined,
    });
    expect(result).toEqual(response);
  });

  it('requests personalized data through the central API client', async () => {
    const response = {
      sections: [],
      isPersonalized: false,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    };

    (api.get as jest.Mock).mockResolvedValue(response);

    const result = await getHomePersonalized({ type: 'all', sectionSize: 10 });

    expect(api.get).toHaveBeenCalledWith('/api/home/personalized?type=all&sectionSize=10', {
      signal: undefined,
      headers: undefined,
    });
    expect(result).toEqual(response);
  });
});
