import { resolveSearchDisplayMode } from '@/features/search/utils/search-display-mode';

describe('resolveSearchDisplayMode', () => {
  it('enters results mode when submitted query matches the input', () => {
    expect(
      resolveSearchDisplayMode({
        inputText: 'interstellar',
        submittedQuery: 'interstellar',
        debouncedInput: 'interstellar',
      }),
    ).toBe('results');
  });

  it('falls back to autocomplete when stale submit text no longer matches the input', () => {
    expect(
      resolveSearchDisplayMode({
        inputText: 'interstellar',
        submittedQuery: 'interste',
        debouncedInput: 'interstellar',
      }),
    ).toBe('autocomplete');
  });

  it('enters results mode after native submit text is applied to both input and submitted query', () => {
    expect(
      resolveSearchDisplayMode({
        inputText: 'interstellar',
        submittedQuery: 'interstellar',
        debouncedInput: 'interste',
      }),
    ).toBe('results');
  });

  it('returns explore when there is no active query', () => {
    expect(
      resolveSearchDisplayMode({
        inputText: '',
        submittedQuery: '',
        debouncedInput: '',
      }),
    ).toBe('explore');
  });
});
