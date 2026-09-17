import { getInitialState } from '@/hooks/useRemoteImageState';

describe('useRemoteImageState', () => {
  it('starts loading for a valid URL', () => {
    expect(getInitialState('https://example.com/poster.jpg')).toBe('loading');
  });

  it('uses error state for missing URL without loading', () => {
    expect(getInitialState(null)).toBe('error');
    expect(getInitialState(undefined)).toBe('error');
    expect(getInitialState('')).toBe('error');
  });

  it('resets to loading when a new valid source is provided', () => {
    expect(getInitialState('https://example.com/b.jpg')).toBe('loading');
  });

  it('resets to error when the source becomes missing', () => {
    expect(getInitialState(null)).toBe('error');
  });
});
