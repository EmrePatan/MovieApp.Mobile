export function shouldSkipHomeSilentReselectRefresh(isFetching: boolean): boolean {
  return isFetching;
}

export function performHomeSilentReselectRefresh(
  refetch: () => Promise<unknown>,
  isFetching: boolean,
): void {
  if (shouldSkipHomeSilentReselectRefresh(isFetching)) {
    return;
  }

  void refetch();
}
