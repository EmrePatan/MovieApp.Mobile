import {
  getCatalogShareAppOpenHost,
  getCatalogShareCanonicalHost,
  getCatalogShareUniversalLinkHosts,
} from '@/config/catalog-share-hosts';

describe('catalog share hosts', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_APP_WEB_URL = 'https://moviecaveapp.com';
    delete process.env.EXPO_PUBLIC_APP_OPEN_WEB_URL;
  });

  it('keeps canonical host on moviecaveapp.com', () => {
    expect(getCatalogShareCanonicalHost()).toBe('moviecaveapp.com');
  });

  it('derives open host for app handoff', () => {
    expect(getCatalogShareAppOpenHost()).toBe('open.moviecaveapp.com');
  });

  it('includes both hosts for universal links', () => {
    expect(getCatalogShareUniversalLinkHosts()).toEqual([
      'moviecaveapp.com',
      'open.moviecaveapp.com',
    ]);
  });
});
