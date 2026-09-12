import {
  isValidSearchQuery,
  normalizeSearchQuery,
} from '@/features/search/utils/search-query';

describe('search query utils', () => {
  it('normalizes whitespace', () => {
    expect(normalizeSearchQuery('  inter   stellar  ')).toBe('inter stellar');
  });

  it('validates minimum and maximum query length', () => {
    expect(isValidSearchQuery('a')).toBe(false);
    expect(isValidSearchQuery('ab')).toBe(true);
    expect(isValidSearchQuery('a'.repeat(100))).toBe(true);
    expect(isValidSearchQuery('a'.repeat(101))).toBe(false);
  });

  it('rejects whitespace-only queries', () => {
    expect(isValidSearchQuery('   ')).toBe(false);
  });
});
