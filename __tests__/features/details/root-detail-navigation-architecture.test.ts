import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  openCatalogDetailFromLibraryStack,
  openCatalogDetailFromTab,
} from '@/features/details/shared/navigation/catalog-detail-navigation';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';

const APP_SHELL = 'app/(tabs)/(app-shell)';

describe('root detail navigation architecture', () => {
  it('does not register movie, tv, person, or collection as tab screens', () => {
    const tabsLayout = readFileSync(
      path.join(process.cwd(), 'app/(tabs)/_layout.tsx'),
      'utf8',
    );

    expect(tabsLayout).not.toContain('name="movie"');
    expect(tabsLayout).not.toContain('name="tv"');
    expect(tabsLayout).not.toContain('name="person"');
    expect(tabsLayout).not.toContain('name="collection"');
    expect(tabsLayout).not.toContain('name="reviews"');
    expect(tabsLayout).not.toContain('name="credits"');
    expect(tabsLayout).not.toContain('name="gallery"');
  });

  it('registers catalog detail stacks in the authenticated app-shell stack, not on the root navigator', () => {
    const rootLayout = readFileSync(path.join(process.cwd(), 'app/_layout.tsx'), 'utf8');
    const appShellLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/_layout.tsx`),
      'utf8',
    );
    const movieLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/_layout.tsx`),
      'utf8',
    );
    const tvLayout = readFileSync(path.join(process.cwd(), `${APP_SHELL}/tv/_layout.tsx`), 'utf8');
    const personLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/person/_layout.tsx`),
      'utf8',
    );

    expect(rootLayout).not.toContain('name="movie"');
    expect(rootLayout).not.toContain('name="tv"');
    expect(rootLayout).not.toContain('name="person"');
    expect(rootLayout).not.toContain('name="collection"');
    expect(appShellLayout).toContain('name="movie" options={ratedDetailStackScreenOptions}');
    expect(appShellLayout).toContain('name="tv" options={ratedDetailStackScreenOptions}');
    expect(appShellLayout).toContain('name="person"');
    expect(appShellLayout).toContain('name="collection"');
    expect(movieLayout).toContain('ratedDetailStackScreenOptions');
    expect(tvLayout).toContain('name="[id]"');
    expect(tvLayout).toContain('ratedDetailStackScreenOptions');
    expect(personLayout).toContain('name="[tmdbId]"');
  });

  it('keeps browse and result routes in the app-shell stack with a navigator-owned custom tab bar', () => {
    const tabsLayout = readFileSync(
      path.join(process.cwd(), 'app/(tabs)/_layout.tsx'),
      'utf8',
    );
    const appShellLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/_layout.tsx`),
      'utf8',
    );

    expect(tabsLayout).toContain('tabBar={() => <PrimaryTabBar />}');
    expect(tabsLayout).toContain('name="(app-shell)"');
    expect(appShellLayout).toContain('name="search"');
    expect(appShellLayout).toContain('name="discover-browse"');
    expect(appShellLayout).toContain('name="upcoming"');
    expect(appShellLayout).toContain('name="now-in-theaters"');
    expect(appShellLayout).toContain('name="world-cinema"');
  });

  it('keeps reviews, credits, and gallery nested inside catalog detail stacks', () => {
    const movieLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/_layout.tsx`),
      'utf8',
    );
    const movieDetailLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/[id]/_layout.tsx`),
      'utf8',
    );
    const tvLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/tv/_layout.tsx`),
      'utf8',
    );
    const tvDetailLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/tv/[id]/_layout.tsx`),
      'utf8',
    );

    expect(movieLayout).toContain('name="[id]"');
    expect(movieDetailLayout).toContain('name="reviews"');
    expect(movieDetailLayout).toContain('name="credits"');
    expect(movieDetailLayout).toContain('name="gallery"');
    expect(tvLayout).toContain('name="[id]"');
    expect(tvDetailLayout).toContain('name="reviews"');
    expect(tvDetailLayout).toContain('name="credits"');
    expect(tvDetailLayout).toContain('name="gallery"');
  });

  it('only enables rating navigation gesture lock on catalog detail index screens', () => {
    const movieIndex = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/[id]/index.tsx`),
      'utf8',
    );
    const tvIndex = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/tv/[id]/index.tsx`),
      'utf8',
    );
    const movieReviews = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/[id]/reviews.tsx`),
      'utf8',
    );

    expect(movieIndex).toContain('enableRatingNavigationGestureLock');
    expect(tvIndex).toContain('enableRatingNavigationGestureLock');
    expect(movieReviews).not.toContain('enableRatingNavigationGestureLock');
    expect(movieReviews).not.toContain('DetailQueryState');
  });

  it('uses the same global movie route from tab and discover callers', () => {
    const push = jest.fn();
    const router = { push } as never;
    const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    openCatalogDetailFromTab(router, movieId, 'movie', 'discover');
    expect(push).toHaveBeenLastCalledWith(buildCatalogDetailRoute(movieId, 'movie'));

    openCatalogDetailFromTab(router, movieId, 'movie', 'home');
    expect(push).toHaveBeenLastCalledWith(buildCatalogDetailRoute(movieId, 'movie'));

    openCatalogDetailFromTab(router, movieId, 'movie', 'search');
    expect(push).toHaveBeenLastCalledWith(buildCatalogDetailRoute(movieId, 'movie'));

    openCatalogDetailFromTab(router, movieId, 'movie', 'library');
    expect(push).toHaveBeenLastCalledWith(buildCatalogDetailRoute(movieId, 'movie'));

    openCatalogDetailFromLibraryStack(router, movieId, 'movie', 'discover');
    expect(push).toHaveBeenLastCalledWith(buildCatalogDetailRoute(movieId, 'movie'));
  });
});
