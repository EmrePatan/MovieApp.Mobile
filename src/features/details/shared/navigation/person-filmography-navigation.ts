import type { ImperativeRouter } from 'expo-router';

let lastPersonFilmographyReturnHref: string | null = null;

export function isPersonFilmographyRoute(segments: readonly string[]): boolean {
  const tabsIndex = segments.indexOf('(tabs)');
  if (tabsIndex === -1) {
    return false;
  }

  if (segments[tabsIndex + 1] !== 'person') {
    return false;
  }

  return segments[tabsIndex + 3] === 'filmography';
}

export function openPersonFilmography(
  router: ImperativeRouter,
  filmographyRoute: string,
  returnHref: string,
): void {
  lastPersonFilmographyReturnHref = returnHref;
  router.push(filmographyRoute);
}

export function returnFromPersonFilmography(router: ImperativeRouter): void {
  const returnHref = lastPersonFilmographyReturnHref;
  lastPersonFilmographyReturnHref = null;

  if (returnHref) {
    router.navigate(returnHref);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.navigate('/(tabs)/home');
}

export function resetPersonFilmographyNavigationForTests(): void {
  lastPersonFilmographyReturnHref = null;
}
