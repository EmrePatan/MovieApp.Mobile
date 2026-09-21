import type { LayoutChangeEvent } from 'react-native';
import { Dimensions } from 'react-native';
import { layout } from '@/theme/layout';
import { logNavigationDiagnostic } from './navigation-diagnostics';

export function logSearchResultCardEnter(payload: Record<string, unknown>): void {
  if (!__DEV__) {
    return;
  }

  const windowWidth = Dimensions.get('window').width;
  const posterWidth = layout.posterList.width;
  const posterHeight = layout.posterList.height;
  const paddingHorizontal = layout.screenPaddingHorizontal;

  logNavigationDiagnostic('search-card:component-enter', {
    windowWidth,
    posterWidth,
    posterHeight,
    cardPaddingHorizontal: paddingHorizontal,
    estimatedContentWidth: windowWidth - paddingHorizontal * 2,
    metaFlex: 1,
    ...payload,
  });
}

export function searchResultCardLayoutHandler(
  probe: string,
  extra: Record<string, unknown> = {},
) {
  return (event: LayoutChangeEvent) => {
    if (!__DEV__) {
      return;
    }

    const { x, y, width, height } = event.nativeEvent.layout;
    logNavigationDiagnostic(`search-card:${probe}`, {
      x,
      y,
      width,
      height,
      ...extra,
    });
  };
}
