import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('production Expo universal link config', () => {
  it('includes associatedDomains and Android intent filters for catalog paths', () => {
    const source = readFileSync(path.join(process.cwd(), 'app.config.ts'), 'utf8');

    expect(source).toContain('associatedDomains');
    expect(source).toContain('applinks:');
    expect(source).toContain('intentFilters');
    expect(source).toContain("pathPrefix: '/movie'");
    expect(source).toContain("pathPrefix: '/tv'");
    expect(source).toContain('EXPO_PUBLIC_APP_WEB_URL');
  });
});
