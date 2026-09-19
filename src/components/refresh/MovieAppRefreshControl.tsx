import { Platform, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const accessibilityLabel = refreshing
    ? t('common.refreshRefreshing')
    : t('common.refreshPulling');

  return (
    <RefreshControl
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={refreshing ? undefined : t('common.refreshHint')}
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.accent}
      title={
        Platform.OS === 'ios'
          ? refreshing
            ? t('common.refreshRefreshing')
            : t('common.refreshPulling')
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
