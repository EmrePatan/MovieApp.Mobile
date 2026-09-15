import {
  formatCatalogYear,
  formatContentType,
  formatIsoDate,
  formatKnownForDepartment,
  formatRuntimeMinutes,
  shouldShowOriginalTitle,
} from '@/utils/format';

describe('format helpers', () => {
  it('formats iso dates', () => {
    expect(formatIsoDate('2014-11-07')).toBeTruthy();
    expect(formatIsoDate(null)).toBeNull();
  });

  it('formats runtime minutes', () => {
    expect(formatRuntimeMinutes(169)).toBe('2h 49m');
    expect(formatRuntimeMinutes(null)).toBeNull();
  });

  it('decides when to show original title', () => {
    expect(shouldShowOriginalTitle('Title', 'Other')).toBe(true);
    expect(shouldShowOriginalTitle('Title', 'Title')).toBe(false);
    expect(shouldShowOriginalTitle('Title', null)).toBe(false);
  });

  it('formats content type and catalog year', () => {
    expect(formatContentType('movie')).toBe('Movie');
    expect(formatContentType('tv')).toBe('TV');
    expect(formatContentType('person')).toBe('Person');
    expect(formatCatalogYear('2014-11-07', null)).toBe('2014');
    expect(formatCatalogYear(null, 2010)).toBe('2010');
    expect(formatCatalogYear(null, null)).toBeNull();
  });

  it('formats known-for department', () => {
    expect(formatKnownForDepartment('Acting')).toBe('Acting');
    expect(formatKnownForDepartment('  Directing  ')).toBe('Directing');
    expect(formatKnownForDepartment(null)).toBeNull();
    expect(formatKnownForDepartment('')).toBeNull();
  });
});
