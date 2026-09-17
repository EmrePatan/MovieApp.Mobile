import { Platform, RefreshControl } from 'react-native';
import {
  REFRESH_IOS_PULL_TITLE,
  REFRESH_IOS_REFRESHING_TITLE,
} from './refresh-control-constants';
import { colors } from '@/theme/colors';

export interface MovieAppRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  testID?: string;
  progressViewOffset?: number;
}

export function MovieAppRefreshControl({
  refreshing,
  onRefresh,
  testID = 'movieapp-refresh-control',
  progressViewOffset,
}: MovieAppRefreshControlProps) {
  const accessibilityLabel = refreshing ? 'Refreshing content' : 'Pull to refresh';

  return (
    <RefreshControl
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={
        refreshing ? undefined : 'Pull down and release to refresh this list'
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.accent}
      title={
        Platform.OS === 'ios'
          ? refreshing
            ? REFRESH_IOS_REFRESHING_TITLE
            : REFRESH_IOS_PULL_TITLE
          : undefined
      }
      titleColor={colors.textSecondary}
      colors={Platform.OS === 'android' ? [colors.accent] : undefined}
      progressBackgroundColor={
        Platform.OS === 'android' ? colors.surfaceElevated : undefined
      }
      progressViewOffset={progressViewOffset}
    />
  );
}
