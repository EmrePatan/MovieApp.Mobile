import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  openCatalogDetailFromLibraryStack,
  openCatalogDetailFromTab,
  resetCatalogDetailOriginForTests,
} from '@/features/details/shared/navigation/catalog-detail-navigation';
import { openPersonDetail } from '@/features/details/shared/navigation/person-detail-navigation';
import {
  buildCatalogDetailRoute,
  buildMovieDetailRoute,
  buildPersonDetailRoute,
  buildTvDetailRoute,
} from '@/features/details/shared/routes';

const MOVIE_A = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const MOVIE_B = '4fa85f64-5717-4562-b3fc-2c963f66afa7';
const TV_A = '5fa85f64-5717-4562-b3fc-2c963f66afa8';
const TV_B = '6fa85f64-5717-4562-b3fc-2c963f66afa9';
const PERSON_A = 1001;
const PERSON_B = 1002;

function createNavigationRecorder() {
  const pushes: string[] = [];
  const stack: string[] = [];

  return {
    pushes,
    stack,
    router: {
      push: jest.fn((href: string) => {
        pushes.push(href);
        stack.push(href);
      }),
      back: jest.fn(() => {
        stack.pop();
      }),
    },
  };
}

describe('catalog detail route identity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetCatalogDetailOriginForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registers dynamic detail stacks on the root navigator, not as tab siblings', () => {
    const rootLayout = readFileSync(path.join(process.cwd(), 'app/_layout.tsx'), 'utf8');
    const tabsLayout = readFileSync(path.join(process.cwd(), 'app/(tabs)/_layout.tsx'), 'utf8');

    expect(rootLayout).toContain('name="movie" options={ratedDetailStackScreenOptions}');
    expect(rootLayout).toContain('name="tv" options={ratedDetailStackScreenOptions}');
    expect(rootLayout).toContain('name="person"');
    expect(rootLayout).toContain('name="collection"');
    expect(tabsLayout).not.toContain('name="movie"');
    expect(tabsLayout).not.toContain('name="tv"');
    expect(tabsLayout).not.toContain('name="person"');
    expect(tabsLayout).not.toContain('name="collection"');
  });

  it('Search → movie A → Back → movie B pushes distinct root-stack hrefs', () => {
    const { pushes, stack, router } = createNavigationRecorder();

    openCatalogDetailFromTab(router as never, MOVIE_A, 'movie', 'search');
    expect(pushes).toEqual([buildMovieDetailRoute(MOVIE_A)]);
    expect(stack).toEqual([buildMovieDetailRoute(MOVIE_A)]);

    router.back();
    expect(stack).toEqual([]);

    jest.advanceTimersByTime(800);
    openCatalogDetailFromTab(router as never, MOVIE_B, 'movie', 'search');
    expect(pushes).toEqual([buildMovieDetailRoute(MOVIE_A), buildMovieDetailRoute(MOVIE_B)]);
    expect(stack).toEqual([buildMovieDetailRoute(MOVIE_B)]);
    expect(stack.at(-1)).not.toBe(buildMovieDetailRoute(MOVIE_A));
  });

  it('movie A → Back → movie B from home uses distinct hrefs', () => {
    const { pushes, stack, router } = createNavigationRecorder();

    openCatalogDetailFromTab(router as never, MOVIE_A, 'movie', 'home');
    router.back();
    jest.advanceTimersByTime(800);
    openCatalogDetailFromTab(router as never, MOVIE_B, 'movie', 'home');

    expect(pushes).toEqual([buildMovieDetailRoute(MOVIE_A), buildMovieDetailRoute(MOVIE_B)]);
    expect(stack).toEqual([buildMovieDetailRoute(MOVIE_B)]);
  });

  it('TV A → Back → TV B uses distinct hrefs', () => {
    const { pushes, stack, router } = createNavigationRecorder();

    openCatalogDetailFromTab(router as never, TV_A, 'tv', 'search');
    router.back();
    jest.advanceTimersByTime(800);
    openCatalogDetailFromTab(router as never, TV_B, 'tv', 'search');

    expect(pushes).toEqual([buildTvDetailRoute(TV_A), buildTvDetailRoute(TV_B)]);
    expect(stack).toEqual([buildTvDetailRoute(TV_B)]);
  });

  it('person A → Back → person B uses distinct hrefs', () => {
    const { pushes, stack, router } = createNavigationRecorder();

    openPersonDetail(router as never, PERSON_A);
    router.back();
    openPersonDetail(router as never, PERSON_B);

    expect(pushes).toEqual([
      buildPersonDetailRoute(PERSON_A),
      buildPersonDetailRoute(PERSON_B),
    ]);
    expect(stack).toEqual([buildPersonDetailRoute(PERSON_B)]);
  });

  it('result list → movie A → Back → movie B uses distinct hrefs', () => {
    const { pushes, stack, router } = createNavigationRecorder();

    openCatalogDetailFromLibraryStack(router as never, MOVIE_A, 'movie', 'upcoming');
    router.back();
    jest.advanceTimersByTime(800);
    openCatalogDetailFromLibraryStack(router as never, MOVIE_B, 'movie', 'upcoming');

    expect(pushes).toEqual([buildMovieDetailRoute(MOVIE_A), buildMovieDetailRoute(MOVIE_B)]);
    expect(stack).toEqual([buildMovieDetailRoute(MOVIE_B)]);
  });

  it('does not suppress a different catalog id within the debounce window', () => {
    const router = { push: jest.fn() };

    openCatalogDetailFromTab(router as never, MOVIE_A, 'movie', 'search');
    openCatalogDetailFromTab(router as never, MOVIE_B, 'movie', 'search');

    expect(router.push).toHaveBeenNthCalledWith(1, buildCatalogDetailRoute(MOVIE_A, 'movie'));
    expect(router.push).toHaveBeenNthCalledWith(2, buildCatalogDetailRoute(MOVIE_B, 'movie'));
  });
});
