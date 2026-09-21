import type { ReactElement } from 'react';
import type { FlatListProps } from 'react-native';

export function mergePlatformListHeader(
  androidRefreshHeader: ReactElement | null,
  listHeader: FlatListProps<unknown>['ListHeaderComponent'],
): FlatListProps<unknown>['ListHeaderComponent'] {
  if (!androidRefreshHeader) {
    return listHeader;
  }

  if (!listHeader) {
    return androidRefreshHeader;
  }

  if (typeof listHeader === 'function') {
    const HeaderComponent = listHeader;

    function MergedListHeader() {
      return (
        <>
          {androidRefreshHeader}
          <HeaderComponent />
        </>
      );
    }

    return MergedListHeader;
  }

  return (
    <>
      {androidRefreshHeader}
      {listHeader}
    </>
  );
}
