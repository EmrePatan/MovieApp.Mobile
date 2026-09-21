import { Platform, type FlatListProps, type StyleProp, type ViewStyle } from 'react-native';
import { LIST_SCREEN_BODY_STYLE } from './StackListScreen';

export function mergeFlatListStyle(
  style?: StyleProp<ViewStyle>,
): StyleProp<ViewStyle> {
  return [LIST_SCREEN_BODY_STYLE, style];
}

export function getFlatListClippingProps<T>(
  removeClippedSubviews?: boolean,
): Pick<FlatListProps<T>, 'removeClippedSubviews'> {
  if (Platform.OS === 'android') {
    return { removeClippedSubviews: false };
  }

  return removeClippedSubviews === undefined ? {} : { removeClippedSubviews };
}
