import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('primary bottom navigation IA', () => {
  const tabsLayoutSource = readFileSync(
    join(process.cwd(), 'app/(tabs)/_layout.tsx'),
    'utf8',
  );
  const tabBarSource = readFileSync(
    join(process.cwd(), 'src/features/navigation/PrimaryTabBar.tsx'),
    'utf8',
  );

  it('exposes Home, Discover, Library, and Insights through the navigator-owned tab bar', () => {
    expect(tabsLayoutSource).toContain('tabBar={() => <PrimaryTabBar />}');
    expect(tabBarSource).toContain("labelKey: 'tabs.home'");
    expect(tabBarSource).toContain("labelKey: 'tabs.discover'");
    expect(tabBarSource).toContain("labelKey: 'tabs.library'");
    expect(tabBarSource).toContain("labelKey: 'tabs.insights'");
    expect(tabsLayoutSource).toMatch(/name="profile"/);
  });

  it('hides Watchlist from the bottom tab bar', () => {
    expect(tabsLayoutSource).toMatch(/name="watchlist"\s+options=\{hiddenTabScreenOptions\}/);
  });
});
