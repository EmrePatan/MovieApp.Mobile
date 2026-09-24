import { resolveRenderableBrandSvg } from '@/features/external-ratings/utils/brand-svg';

describe('resolveRenderableBrandSvg', () => {
  it('returns svg payload when valid', () => {
    const xml = '<?xml version="1.0"?><svg viewBox="0 0 10 10"></svg>';
    expect(resolveRenderableBrandSvg(xml)).toContain('<svg');
  });

  it('rejects html error pages', () => {
    expect(resolveRenderableBrandSvg('<!DOCTYPE html><html></html>')).toBeNull();
  });
});
