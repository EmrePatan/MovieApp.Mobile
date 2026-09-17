import { buildCatalogDetailRoute } from '@/features/details/shared/routes';

type NavigationEvent =
  | { type: 'push'; href: string }
  | { type: 'back' };

/**
 * Models the root stack above tabs. Each catalog detail push adds a screen on
 * top of the current root history, and back pops to the previous root screen.
 */
class RootCatalogNavigationSimulator {
  readonly events: NavigationEvent[] = [];

  private readonly rootStack: string[] = ['/(tabs)'];

  push(href: string) {
    this.events.push({ type: 'push', href });
    this.rootStack.push(href);
  }

  back() {
    this.events.push({ type: 'back' });
    if (this.rootStack.length > 1) {
      this.rootStack.pop();
    }
  }

  currentRoute(): string {
    return this.rootStack[this.rootStack.length - 1] ?? '/(tabs)';
  }

  rootDepth(): number {
    return this.rootStack.length;
  }
}

describe('root catalog navigation stack semantics', () => {
  it('opens A, returns to tabs, opens B, returns to tabs, opens C, returns to tabs', () => {
    const navigation = new RootCatalogNavigationSimulator();

    navigation.push(buildCatalogDetailRoute('a', 'movie'));
    expect(navigation.currentRoute()).toBe('/movie/a');
    expect(navigation.rootDepth()).toBe(2);

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)');
    expect(navigation.rootDepth()).toBe(1);

    navigation.push(buildCatalogDetailRoute('b', 'movie'));
    expect(navigation.currentRoute()).toBe('/movie/b');

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)');

    navigation.push(buildCatalogDetailRoute('c', 'movie'));
    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)');
  });

  it('does not keep A underneath B after returning to tabs', () => {
    const navigation = new RootCatalogNavigationSimulator();

    navigation.push(buildCatalogDetailRoute('a', 'movie'));
    navigation.back();
    navigation.push(buildCatalogDetailRoute('b', 'movie'));

    expect(navigation.currentRoute()).toBe('/movie/b');
    expect(navigation.rootDepth()).toBe(2);

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)');
    expect(navigation.rootDepth()).toBe(1);
  });

  it('preserves an intermediate discover screen beneath detail', () => {
    const navigation = new RootCatalogNavigationSimulator();

    navigation.push('/world-cinema?region=KR');
    navigation.push(buildCatalogDetailRoute('colony', 'movie'));

    expect(navigation.currentRoute()).toBe('/movie/colony');
    expect(navigation.rootDepth()).toBe(3);

    navigation.back();
    expect(navigation.currentRoute()).toBe('/world-cinema?region=KR');
  });
});
