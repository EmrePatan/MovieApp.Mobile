import {
  canStackGoBack,
  highlightedTabForStack,
  simulateContentBack,
  simulateContentPush,
  simulatePrimaryTabPressOnStack,
  stackPathname,
  type AppShellStackState,
} from '@/features/navigation/primary-tab-stack-semantics';

function root(route: string): AppShellStackState {
  return { routes: [route], index: 0 };
}

describe('primary tab stack semantics', () => {
  it('A) Home → Discover → Home → Discover does not create replayable primary-root history', () => {
    let state = root('/home');

    state = simulatePrimaryTabPressOnStack({
      state,
      tabId: 'discover',
      pathname: '/home',
    }).state;
    expect(state).toEqual({ routes: ['/discover'], index: 0 });
    expect(canStackGoBack(state)).toBe(false);

    state = simulatePrimaryTabPressOnStack({
      state,
      tabId: 'home',
      pathname: '/discover',
    }).state;
    expect(state).toEqual({ routes: ['/home'], index: 0 });
    expect(canStackGoBack(state)).toBe(false);

    state = simulatePrimaryTabPressOnStack({
      state,
      tabId: 'discover',
      pathname: '/home',
    }).state;
    expect(state).toEqual({ routes: ['/discover'], index: 0 });
    expect(canStackGoBack(state)).toBe(false);
  });

  it('B) Home → Discover → Library → Insights → Home does not create replayable primary-root history', () => {
    let state = root('/home');

    for (const tab of ['discover', 'library', 'insights', 'home'] as const) {
      state = simulatePrimaryTabPressOnStack({
        state,
        tabId: tab,
        pathname: stackPathname(state),
      }).state;
    }

    expect(state).toEqual({ routes: ['/home'], index: 0 });
    expect(canStackGoBack(state)).toBe(false);
  });

  it('C) Discover → Browse → Movie still supports content Back to Browse and Discover', () => {
    let state = root('/discover');
    state = simulateContentPush(state, '/discover-browse');
    state = simulateContentPush(state, '/movie/a');

    expect(stackPathname(state)).toBe('/movie/a');
    expect(highlightedTabForStack(state)).toBeNull();

    state = simulateContentBack(state);
    expect(stackPathname(state)).toBe('/discover-browse');

    state = simulateContentBack(state);
    expect(stackPathname(state)).toBe('/discover');
    expect(highlightedTabForStack(state)).toBe('discover');
  });

  it('D) Discover → Browse → Movie → Home → Movie B → Back stops at Home without old Discover flow', () => {
    let state = root('/discover');
    state = simulateContentPush(state, '/discover-browse');
    state = simulateContentPush(state, '/movie/a');

    state = simulatePrimaryTabPressOnStack({
      state,
      tabId: 'home',
      pathname: '/movie/a',
    }).state;

    expect(state).toEqual({ routes: ['/home'], index: 0 });
    expect(canStackGoBack(state)).toBe(false);

    state = simulateContentPush(state, '/movie/b');
    state = simulateContentBack(state);

    expect(stackPathname(state)).toBe('/home');
    expect(canStackGoBack(state)).toBe(false);
  });

  it('E) Home → Movie → Back preserves Home as the only stack entry', () => {
    let state = root('/home');
    state = simulateContentPush(state, '/movie/a');

    expect(highlightedTabForStack(state)).toBeNull();

    state = simulateContentBack(state);

    expect(stackPathname(state)).toBe('/home');
    expect(highlightedTabForStack(state)).toBe('home');
    expect(canStackGoBack(state)).toBe(false);
  });

  it('F) Movie detail keeps neutral highlighted tab semantics', () => {
    const state = simulateContentPush(root('/home'), '/movie/a');

    expect(highlightedTabForStack(state)).toBeNull();
  });

  it('G) Home root reselect does not mutate stack history', () => {
    const initial = root('/home');
    const result = simulatePrimaryTabPressOnStack({
      state: initial,
      tabId: 'home',
      pathname: '/home',
    });

    expect(result.reselectCount).toBe(1);
    expect(result.state).toEqual(initial);
  });

  it('H) repeated active-root reselect does not add navigation entries', () => {
    let state = root('/home');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = simulatePrimaryTabPressOnStack({
        state,
        tabId: 'home',
        pathname: '/home',
      });
      expect(result.state).toEqual({ routes: ['/home'], index: 0 });
      expect(result.reselectCount).toBe(1);
      state = result.state;
    }
  });
});
