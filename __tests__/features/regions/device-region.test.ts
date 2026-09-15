import {
  parseRegionFromLocaleTag,
  resolveDeviceRegion,
  resolveInitialRegionalPreference,
} from '@/features/regions/utils/device-region';

describe('device-region', () => {
  it('maps tr-TR to TR', () => {
    expect(parseRegionFromLocaleTag('tr-TR')).toBe('TR');
  });

  it('maps en-US to US', () => {
    expect(parseRegionFromLocaleTag('en-US')).toBe('US');
  });

  it('maps en-GB to GB', () => {
    expect(parseRegionFromLocaleTag('en-GB')).toBe('GB');
  });

  it('does not invent a country from language-only locale', () => {
    expect(parseRegionFromLocaleTag('en')).toBeNull();
  });

  it('falls back safely for malformed locale tags', () => {
    expect(parseRegionFromLocaleTag('not-a-locale')).toBeNull();
    expect(resolveDeviceRegion('')).toBeNull();
  });

  it('prefers saved preference over device locale', () => {
    const resolved = resolveInitialRegionalPreference('US', 'tr-TR');
    expect(resolved).toEqual({ region: 'US', source: 'saved' });
  });

  it('uses device locale when no saved preference exists', () => {
    const resolved = resolveInitialRegionalPreference(null, 'en-GB');
    expect(resolved).toEqual({ region: 'GB', source: 'device' });
  });

  it('falls back to TR when no saved preference or device region exists', () => {
    const resolved = resolveInitialRegionalPreference(null, 'en');
    expect(resolved).toEqual({ region: 'TR', source: 'fallback' });
  });
});
