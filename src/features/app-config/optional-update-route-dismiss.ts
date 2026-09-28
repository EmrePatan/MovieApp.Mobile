/**
 * Session-only dismiss when the user navigates away while the optional banner is visible.
 * Does not fire on the initial path capture while the banner is hidden.
 */
export function shouldDismissOptionalUpdateOnRouteChange(
  isBannerVisible: boolean,
  previousPath: string | null,
  nextPath: string,
): boolean {
  if (!isBannerVisible) {
    return false;
  }

  if (previousPath === null) {
    return false;
  }

  return previousPath !== nextPath;
}
