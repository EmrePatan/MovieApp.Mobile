import type { PrimaryTabPressPlan } from '@/features/navigation/primary-tab-press';
import {
  isPrimaryTabRootPath,
  PRIMARY_TAB_HREFS,
  resolveActivePrimaryTab,
  type HighlightedPrimaryTab,
  type PrimaryTabId,
} from '@/features/navigation/primary-tab-routes';
import { resolvePrimaryTabPressPlan } from '@/features/navigation/primary-tab-press';

export type AppShellStackState = {
  routes: readonly string[];
  index: number;
};

export type StackTransitionResult = {
  state: AppShellStackState;
  reselectCount: number;
};

function routeFromPathname(pathname: string): string {
  return pathname;
}

function simulateDismissAll(state: AppShellStackState): AppShellStackState {
  if (state.routes.length <= 1) {
    return state;
  }

  return {
    routes: [state.routes[0]],
    index: 0,
  };
}

function simulateDismissTo(state: AppShellStackState, href: string): AppShellStackState {
  const targetRoute = routeFromPathname(href);
  let foundIndex = -1;

  for (let index = state.index; index >= 0; index -= 1) {
    if (state.routes[index] === targetRoute) {
      foundIndex = index;
      break;
    }
  }

  if (foundIndex >= 0) {
    return {
      routes: state.routes.slice(0, foundIndex + 1),
      index: foundIndex,
    };
  }

  const routes = [...state.routes.slice(0, state.index), targetRoute];
  return {
    routes,
    index: routes.length - 1,
  };
}

function simulatePush(state: AppShellStackState, href: string): AppShellStackState {
  const route = routeFromPathname(href);
  return {
    routes: [...state.routes, route],
    index: state.routes.length,
  };
}

export function applyPrimaryTabPressPlanToStack(
  state: AppShellStackState,
  plan: PrimaryTabPressPlan,
): StackTransitionResult {
  if (plan.kind === 'reselect') {
    return { state, reselectCount: 1 };
  }

  let nextState = state;

  if (plan.resetStackFirst) {
    nextState = simulateDismissAll(nextState);
  }

  nextState = simulateDismissTo(nextState, plan.href);
  return { state: nextState, reselectCount: 0 };
}

export function simulatePrimaryTabPressOnStack(params: {
  state: AppShellStackState;
  tabId: PrimaryTabId;
  pathname: string;
}): StackTransitionResult {
  const highlightedTab = resolveActivePrimaryTab(params.pathname);
  const plan = resolvePrimaryTabPressPlan({
    tabId: params.tabId,
    pathname: params.pathname,
    highlightedTab,
  });

  return applyPrimaryTabPressPlanToStack(params.state, plan);
}

export function simulateContentPush(
  state: AppShellStackState,
  href: string,
): AppShellStackState {
  return simulatePush(state, href);
}

export function simulateContentBack(state: AppShellStackState): AppShellStackState {
  if (state.index <= 0) {
    return state;
  }

  return {
    routes: state.routes.slice(0, state.index),
    index: state.index - 1,
  };
}

export function canStackGoBack(state: AppShellStackState): boolean {
  return state.index > 0;
}

export function stackPathname(state: AppShellStackState): string {
  return state.routes[state.index] ?? PRIMARY_TAB_HREFS.home;
}

export function highlightedTabForStack(state: AppShellStackState): HighlightedPrimaryTab {
  return resolveActivePrimaryTab(stackPathname(state));
}

export function isPrimaryTabRootState(state: AppShellStackState, tabId: PrimaryTabId): boolean {
  return isPrimaryTabRootPath(tabId, stackPathname(state));
}
