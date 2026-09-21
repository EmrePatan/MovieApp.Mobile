import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('insights navigation', () => {
  it('registers Insights in the custom tab bar and keeps profile hidden', () => {
    const tabsLayoutPath = path.join(process.cwd(), 'app', '(tabs)', '_layout.tsx');
    const tabBarPath = path.join(process.cwd(), 'src', 'features', 'navigation', 'PrimaryTabBar.tsx');
    const tabsLayoutSource = readFileSync(tabsLayoutPath, 'utf8');
    const tabBarSource = readFileSync(tabBarPath, 'utf8');

    expect(tabsLayoutSource).toContain('tabBar={() => <PrimaryTabBar />}');
    expect(tabBarSource).toContain("labelKey: 'tabs.insights'");
    expect(tabsLayoutSource).toContain('name="profile" options={hiddenTabScreenOptions}');
  });

  it('keeps home header profile route reachable', () => {
    const headerPath = path.join(
      process.cwd(),
      'src',
      'features',
      'home',
      'components',
      'HomeHeaderActionCluster.tsx',
    );
    const headerSource = readFileSync(headerPath, 'utf8');

    expect(headerSource).toContain("router.push('/(tabs)/profile')");
  });
});
