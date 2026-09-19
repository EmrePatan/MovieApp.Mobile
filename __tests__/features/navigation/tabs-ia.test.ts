import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('primary bottom navigation IA', () => {
  const layoutSource = readFileSync(
    join(process.cwd(), 'app/(tabs)/_layout.tsx'),
    'utf8',
  );

  it('exposes Home, Discover, Library, and Profile tabs', () => {
    expect(layoutSource).toMatch(/t\('tabs\.home'\)/);
    expect(layoutSource).toMatch(/t\('tabs\.discover'\)/);
    expect(layoutSource).toMatch(/t\('tabs\.library'\)/);
    expect(layoutSource).toMatch(/name="profile"/);
  });

  it('hides Watchlist from the bottom tab bar', () => {
    expect(layoutSource).toMatch(/name="watchlist"\s+options=\{\{\s*href:\s*null\s*\}\}/);
  });
});
