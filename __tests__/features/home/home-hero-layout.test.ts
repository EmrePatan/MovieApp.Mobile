import { getHomeHeroHeight } from '@/features/home/utils/home-hero-layout';

describe('getHomeHeroHeight', () => {
  it('uses a modest responsive height for common phone widths', () => {
    expect(getHomeHeroHeight(390)).toBe(310);
    expect(getHomeHeroHeight(428)).toBe(310);
  });

  it('scales up on wider layouts without exceeding the cap', () => {
    expect(getHomeHeroHeight(600)).toBe(384);
    expect(getHomeHeroHeight(900)).toBe(480);
  });
});
