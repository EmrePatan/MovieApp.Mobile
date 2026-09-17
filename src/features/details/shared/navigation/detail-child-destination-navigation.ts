import type { ImperativeRouter } from 'expo-router';

export function returnToDetailChildOrigin(
  router: ImperativeRouter,
  returnHref: string | null,
): void {
  if (returnHref) {
    router.dismissTo(returnHref);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.navigate('/(tabs)/home');
}
