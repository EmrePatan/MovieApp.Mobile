import { getRegionFlagEmoji } from '@/features/regions/region-options';

describe('region options', () => {
  it('maps region codes to flag emoji', () => {
    expect(getRegionFlagEmoji('TR')).toBe('🇹🇷');
    expect(getRegionFlagEmoji('us')).toBe('🇺🇸');
  });
});
