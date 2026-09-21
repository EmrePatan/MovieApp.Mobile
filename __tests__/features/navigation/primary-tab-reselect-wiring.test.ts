import { readFileSync } from 'node:fs';
import path from 'node:path';

const APP_SHELL = 'app/(tabs)/(app-shell)';

describe('primary tab reselect screen wiring', () => {
  it('registers reselect handlers on all primary tab roots', () => {
    const home = readFileSync(path.join(process.cwd(), `${APP_SHELL}/home.tsx`), 'utf8');
    const discover = readFileSync(
      path.join(process.cwd(), 'src/features/discover/components/DiscoverHubContent.tsx'),
      'utf8',
    );
    const library = readFileSync(
      path.join(process.cwd(), 'src/features/library/components/LibraryHubContent.tsx'),
      'utf8',
    );
    const insights = readFileSync(
      path.join(process.cwd(), 'src/features/insights/components/InsightsHubContent.tsx'),
      'utf8',
    );

    expect(home).toContain("usePrimaryTabReselectHandler('home'");
    expect(discover).toContain("usePrimaryTabReselectHandler('discover'");
    expect(library).toContain("usePrimaryTabReselectHandler('library'");
    expect(insights).toContain("usePrimaryTabReselectHandler('insights'");
  });

  it('returns no highlighted primary tab on catalog detail routes', () => {
    const tabBar = readFileSync(
      path.join(process.cwd(), 'src/features/navigation/PrimaryTabBar.tsx'),
      'utf8',
    );
    const routes = readFileSync(
      path.join(process.cwd(), 'src/features/navigation/primary-tab-routes.ts'),
      'utf8',
    );

    expect(routes).toContain('resolveActivePrimaryTab(pathname: string): HighlightedPrimaryTab');
    expect(routes).toContain('isCatalogDetailRoute');
    expect(tabBar).toContain('const highlightedTab = resolveActivePrimaryTab(pathname)');
    expect(tabBar).toContain('highlightedTab === tab.id');
  });

  it('routes primary tab presses through the shared press handler', () => {
    const tabBar = readFileSync(
      path.join(process.cwd(), 'src/features/navigation/PrimaryTabBar.tsx'),
      'utf8',
    );

    expect(tabBar).toContain('handlePrimaryTabPress');
    expect(tabBar).not.toContain('router.navigate(PRIMARY_TAB_HREFS');
  });
});
