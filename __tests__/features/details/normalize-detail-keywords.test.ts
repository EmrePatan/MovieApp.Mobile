import {
  isDiscoverableDetailKeyword,
  normalizeDetailKeywords,
} from '@/features/details/shared/utils/normalize-detail-keywords';
import { openKeywordDiscoverBrowse } from '@/features/details/shared/navigation/detail-keyword-navigation';
import { createKeywordDiscoverHref } from '@/features/discovery/utils/discover-params';
import { parseDiscoverParams } from '@/features/discovery/utils/discover-params';

const GUID = '11111111-1111-4111-8111-111111111111';

describe('normalizeDetailKeywords', () => {
  it('accepts legacy string[] from production API', () => {
    const result = normalizeDetailKeywords(['Time Travel', 'Space', '']);

    expect(result).toEqual([
      { id: null, name: 'Time Travel' },
      { id: null, name: 'Space' },
    ]);
  });

  it('accepts new { id, name }[] contract', () => {
    const result = normalizeDetailKeywords([
      { id: GUID, name: 'Zeitreise' },
      { name: 'missing id' },
    ]);

    expect(result).toEqual([
      { id: GUID, name: 'Zeitreise' },
      { id: null, name: 'missing id' },
    ]);
  });

  it('returns empty for non-array or empty input', () => {
    expect(normalizeDetailKeywords(null)).toEqual([]);
    expect(normalizeDetailKeywords(undefined)).toEqual([]);
    expect(normalizeDetailKeywords([])).toEqual([]);
  });
});

describe('keyword discoverability', () => {
  it('legacy keywords are not discoverable', () => {
    expect(isDiscoverableDetailKeyword({ id: null, name: 'Space' })).toBe(false);
  });

  it('new keywords with Guid are discoverable', () => {
    expect(isDiscoverableDetailKeyword({ id: GUID, name: 'Space' })).toBe(true);
  });
});

describe('keyword navigation guards', () => {
  const mockPush = jest.fn();
  const router = { push: mockPush } as const;

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('does not navigate for legacy keywords without id', () => {
    openKeywordDiscoverBrowse(router, { id: null, name: 'Time Travel' });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates with the same Guid in route params', () => {
    openKeywordDiscoverBrowse(router, { id: GUID, name: 'Time Travel' });

    expect(mockPush).toHaveBeenCalledTimes(1);
    const href = String(mockPush.mock.calls[0][0]);
    expect(href).toContain(`keywords=${GUID}`);

    const params = parseDiscoverParams(
      Object.fromEntries(new URLSearchParams(href.split('?')[1] ?? '')),
    );
    expect(params.filters.keywordIds).toEqual([GUID]);
    expect(params.filters.keywordLabels[GUID]).toBe('Time Travel');
  });

  it('createKeywordDiscoverHref preserves KeywordId for API layer', () => {
    const href = createKeywordDiscoverHref({ id: GUID, name: 'Aliens' });
    const search = new URLSearchParams(href.split('?')[1] ?? '');
    expect(search.get('keywords')).toBe(GUID);
  });
});
