import { StackRouter } from 'expo-router/build/react-navigation/routers/StackRouter';
import { TabRouter } from 'expo-router/build/react-navigation/routers/TabRouter';

const popToHome = {
  type: 'POP_TO',
  payload: { name: 'home' },
} as const;

describe('POP_TO handling behind primary tab presses', () => {
  it('is ignored by the tab navigator, so tab-press targets must not be sibling tab routes', () => {
    const router = TabRouter({});
    const options = {
      routeNames: ['(app-shell)', 'profile'],
      routeParamList: {},
      routeGetIdList: {},
    };
    const state = router.getInitialState(options);

    expect(router.getStateForAction(state, popToHome, options)).toBeNull();
  });

  it('is handled by the app-shell stack that now owns watchlist', () => {
    const router = StackRouter({});
    const options = {
      routeNames: ['home', 'library', 'watchlist'],
      routeParamList: {},
      routeGetIdList: {},
    };
    let state = router.getInitialState(options);
    state = router.getStateForAction(
      state,
      { type: 'PUSH', payload: { name: 'library' } },
      options,
    ) as typeof state;
    state = router.getStateForAction(
      state,
      { type: 'PUSH', payload: { name: 'watchlist' } },
      options,
    ) as typeof state;

    const next = router.getStateForAction(state, popToHome, options);

    expect(next?.routes.map((route) => route.name)).toEqual(['home']);
  });
});
