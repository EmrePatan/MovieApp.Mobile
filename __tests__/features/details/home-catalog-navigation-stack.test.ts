import { buildCatalogDetailRoute } from '@/features/details/shared/routes';

type NavigationEvent =
  | { type: 'push'; href: string }
  | { type: 'back' };

/**
 * Models the hidden movie/tv tab stacks used by Expo Router tabs.
 * push from Home switches to the detail tab and pushes one screen.
 * back pops that screen and returns to Home when the detail stack is empty.
 */
class TabCatalogNavigationSimulator {
  readonly events: NavigationEvent[] = [];

  private activeTab: 'home' | 'movie' | 'tv' = 'home';

  private readonly movieStack: string[] = [];

  private readonly tvStack: string[] = [];

  push(href: string) {
    this.events.push({ type: 'push', href });

    if (href.startsWith('/movie/')) {
      this.activeTab = 'movie';
      this.movieStack.push(href);
      return;
    }

    if (href.startsWith('/tv/')) {
      this.activeTab = 'tv';
      this.tvStack.push(href);
    }
  }

  back() {
    this.events.push({ type: 'back' });

    if (this.activeTab === 'movie') {
      this.movieStack.pop();
      if (this.movieStack.length === 0) {
        this.activeTab = 'home';
      }
      return;
    }

    if (this.activeTab === 'tv') {
      this.tvStack.pop();
      if (this.tvStack.length === 0) {
        this.activeTab = 'home';
      }
    }
  }

  currentRoute(): string {
    if (this.activeTab === 'home') {
      return '/(tabs)/home';
    }

    const stack = this.activeTab === 'movie' ? this.movieStack : this.tvStack;
    return stack[stack.length - 1] ?? '/(tabs)/home';
  }

  movieStackDepth(): number {
    return this.movieStack.length;
  }
}

describe('Home catalog navigation stack semantics', () => {
  it('opens A, returns Home, opens B, returns Home, opens C, returns Home', () => {
    const navigation = new TabCatalogNavigationSimulator();

    navigation.push(buildCatalogDetailRoute('a', 'movie'));
    expect(navigation.currentRoute()).toBe('/movie/a');
    expect(navigation.movieStackDepth()).toBe(1);

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)/home');
    expect(navigation.movieStackDepth()).toBe(0);

    navigation.push(buildCatalogDetailRoute('b', 'movie'));
    expect(navigation.currentRoute()).toBe('/movie/b');
    expect(navigation.movieStackDepth()).toBe(1);

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)/home');
    expect(navigation.movieStackDepth()).toBe(0);

    navigation.push(buildCatalogDetailRoute('c', 'movie'));
    expect(navigation.currentRoute()).toBe('/movie/c');

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)/home');
    expect(navigation.events).toEqual([
      { type: 'push', href: '/movie/a' },
      { type: 'back' },
      { type: 'push', href: '/movie/b' },
      { type: 'back' },
      { type: 'push', href: '/movie/c' },
      { type: 'back' },
    ]);
  });

  it('does not keep A underneath B after returning to Home', () => {
    const navigation = new TabCatalogNavigationSimulator();

    navigation.push(buildCatalogDetailRoute('a', 'movie'));
    navigation.back();
    navigation.push(buildCatalogDetailRoute('b', 'movie'));

    expect(navigation.currentRoute()).toBe('/movie/b');
    expect(navigation.movieStackDepth()).toBe(1);

    navigation.back();
    expect(navigation.currentRoute()).toBe('/(tabs)/home');
    expect(navigation.movieStackDepth()).toBe(0);
  });
});
