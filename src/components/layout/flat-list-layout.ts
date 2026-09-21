import { Platform, type FlatListProps } from 'react-native';

export function getFlatListClippingProps<T>(
  removeClippedSubviews?: boolean,
): Pick<FlatListProps<T>, 'removeClippedSubviews'> {
  if (Platform.OS === 'android') {
    return { removeClippedSubviews: false };
  }

  return removeClippedSubviews === undefined ? {} : { removeClippedSubviews };
}
