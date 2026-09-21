import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  openCatalogDetailFromLibraryStack,
  openCatalogDetailFromTab,
} from '@/features/details/shared/navigation/catalog-detail-navigation';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';

describe('root detail navigation architecture', () => {
  it('registers movie, tv, person, and collection inside the tabs navigator', () => {
    const tabsLayout = readFileSync(
      path.join(process.cwd(), 'app/(tabs)/_layout.tsx'),
      'utf8',
    );

    expect(tabsLayout).toContain('name="movie" options={hiddenTabScreenOptions}');
    expect(tabsLayout).toContain('name="tv" options={hiddenTabScreenOptions}');
    expect(tabsLayout).toContain('name="person" options={hiddenTabScreenOptions}');
    expect(tabsLayout).toContain('name="collection" options={hiddenTabScreenOptions}');
    expect(tabsLayout).not.toContain('name="reviews"');
    expect(tabsLayout).not.toContain('name="credits"');
    expect(tabsLayout).not.toContain('name="gallery"');
  });

  it('keeps only auth, tabs, and profile settings on the root navigator', () => {
    const rootLayout = readFileSync(path.join(process.cwd(), 'app/_layout.tsx'), 'utf8');

    expect(rootLayout).toContain('name="(auth)"');
    expect(rootLayout).toContain('name="(tabs)"');
    expect(rootLayout).toContain('name="profile"');
    expect(rootLayout).not.toContain('name="movie"');
    expect(rootLayout).not.toContain('name="search"');
    expect(rootLayout).not.toContain('name="notifications"');
  });

  it('keeps reviews, credits, and gallery nested inside catalog detail stacks', () => {
    const movieLayout = readFileSync(path.join(process.cwd(), 'app/(tabs)/movie/_layout.tsx'), 'utf8');
    const movieDetailLayout = readFileSync(
      path.join(process.cwd(), 'app/(tabs)/movie/[id]/_layout.tsx'),
      'utf8',
    );
    const tvLayout = readFileSync(path.join(process.cwd(), 'app/(tabs)/tv/_layout.tsx'), 'utf8');
    const tvDetailLayout = readFileSync(path.join(process.cwd(), 'app/(tabs)/tv/[id]/_layout.tsx'), 'utf8');

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
    const movieIndex = readFileSync(path.join(process.cwd(), 'app/(tabs)/movie/[id]/index.tsx'), 'utf8');
    const tvIndex = readFileSync(path.join(process.cwd(), 'app/(tabs)/tv/[id]/index.tsx'), 'utf8');
    const movieReviews = readFileSync(
      path.join(process.cwd(), 'app/(tabs)/movie/[id]/reviews.tsx'),
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
