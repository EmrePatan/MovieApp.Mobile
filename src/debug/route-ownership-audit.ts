/**
 * #45 route ownership reference — Cast (working) vs discover-browse (broken on Android).
 * Logged at probe mount; not a runtime assertion.
 */
export const ROUTE_OWNERSHIP_AUDIT = {
  castSeeAll: {
    label: 'Cast See All (WORKING)',
    tree: [
      'GestureHandlerRootView (app/_layout)',
      'Root Stack (app/_layout.tsx) — headerShown:false, contentStyle background',
      'Stack.Screen name="movie" — ratedDetailStackScreenOptions',
      'movie/_layout Stack — ratedDetailStackScreenOptions on screenOptions',
      'movie/[id]/_layout Stack — freezeOnBlur:false',
      'Stack.Screen name="credits" — detailChildStackScreenOptions',
      'movie/[id]/credits.tsx — DetailQueryState → CreditsDetailContent',
      'FlatList (component root return)',
    ],
    routeExample: '/movie/{id}/credits',
    navigatorDepth: 3,
    navigation: 'openCreditsDetail → router.push(route, { withAnchor: true })',
    nestedLayoutFiles: ['app/movie/_layout.tsx', 'app/movie/[id]/_layout.tsx'],
  },
  discoverBrowse: {
    label: 'discover-browse See All (BROKEN)',
    tree: [
      'GestureHandlerRootView (app/_layout)',
      'Root Stack (app/_layout.tsx) — headerShown:false, contentStyle background',
      'Stack.Screen name="discover-browse" — default options only',
      'discover-browse.tsx (no nested _layout.tsx)',
      'View commonStyles.screen → FlatList',
    ],
    routeExample: '/discover-browse?mode=trending&type=all',
    navigatorDepth: 1,
    navigation: 'openLibraryStackScreen → router.push(href) — no withAnchor',
    nestedLayoutFiles: [],
  },
  searchResults: {
    label: 'Search submitted results (BROKEN)',
    tree: [
      'GestureHandlerRootView',
      'Root Stack',
      'Stack.Screen name="search" — gestureEnabled:true',
      'search.tsx — FlatList when displayMode=results',
    ],
    routeExample: '/search',
    navigatorDepth: 1,
    navigation: 'tab/router.push to root search screen',
    nestedLayoutFiles: [],
  },
  streamingDiscover: {
    label: 'Streaming provider results (BROKEN)',
    tree: [
      'GestureHandlerRootView',
      'Root Stack',
      'Stack.Screen name="streaming-discover" — default options',
      'streaming-discover.tsx — FlatList when provider selected',
    ],
    routeExample: '/streaming-discover?watchProviderId=8',
    navigatorDepth: 1,
    navigation: 'router.push/setParams on root stack',
    nestedLayoutFiles: [],
  },
} as const;

export const ROUTE_OWNERSHIP_FIRST_DIVERGENCE = [
  'Cast is a 3-level nested Stack child (movie → [id] → credits); discover-browse is a direct Root Stack screen with no nested _layout.',
  'Cast navigation uses router.push(href, { withAnchor: true }); discover-browse uses openLibraryStackScreen → router.push(href) without withAnchor.',
  'Cast screen is wrapped only by DetailQueryState; discover-browse uses View + FlatList at root stack level.',
  'Search and Streaming share the root-stack direct-screen pattern with discover-browse, not the nested detail-child pattern.',
];
