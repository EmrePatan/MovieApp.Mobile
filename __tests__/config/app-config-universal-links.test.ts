import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('production Expo universal link config', () => {
  it('includes associatedDomains and Android intent filters for catalog paths', () => {
    const source = readFileSync(path.join(process.cwd(), 'app.config.ts'), 'utf8');

    expect(source).toContain('associatedDomains');
    expect(source).toContain('applinks:');
    expect(source).toContain('getCatalogShareUniversalLinkHosts');
    expect(source).toContain('intentFilters');
    expect(source).toContain("pathPrefix: '/movie'");
    expect(source).toContain("pathPrefix: '/tv'");
    expect(source).toContain('UNIVERSAL_LINK_HOSTS.flatMap');

    expect(source).toContain('./config/catalog-share-hosts.js');

    const hostsSource = readFileSync(
      path.join(process.cwd(), 'config/catalog-share-hosts.js'),
      'utf8',
    );
    expect(hostsSource).toContain('EXPO_PUBLIC_APP_WEB_URL');
    expect(hostsSource).toContain('open.moviecaveapp.com');
  });
});
