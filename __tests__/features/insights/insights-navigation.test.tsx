import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('insights navigation', () => {
  it('registers Insights as a visible tab and keeps profile hidden', () => {
    const layoutPath = path.join(process.cwd(), 'app', '(tabs)', '_layout.tsx');
    const layoutSource = readFileSync(layoutPath, 'utf8');

    expect(layoutSource).toContain('name="insights"');
    expect(layoutSource).toContain("title: 'Insights'");
    expect(layoutSource).toContain('name="profile" options={{ href: null }}');
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
