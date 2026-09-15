import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('primary bottom navigation IA', () => {
  const layoutSource = readFileSync(
    join(process.cwd(), 'app/(tabs)/_layout.tsx'),
    'utf8',
  );

  it('exposes Home, Discover, Library, and Profile tabs', () => {
    expect(layoutSource).toMatch(/title:\s*'Home'/);
    expect(layoutSource).toMatch(/title:\s*'Discover'/);
    expect(layoutSource).toMatch(/title:\s*'Library'/);
    expect(layoutSource).toMatch(/title:\s*'Profile'/);
  });

  it('hides Search and Watchlist from the bottom tab bar', () => {
    expect(layoutSource).toMatch(/name="search"\s+options=\{\{\s*href:\s*null\s*\}\}/);
    expect(layoutSource).toMatch(/name="watchlist"\s+options=\{\{\s*href:\s*null\s*\}\}/);
  });
});
