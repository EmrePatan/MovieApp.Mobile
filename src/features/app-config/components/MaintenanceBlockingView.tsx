import { useTranslation } from 'react-i18next';
import { AppBlockingState } from '@/components/blocking/AppBlockingState';
import { useAppConfig } from '../hooks/useAppConfig';

export function MaintenanceBlockingView() {
  const { t } = useTranslation();
  const { refreshConfig, isRefreshing } = useAppConfig();

  return (
    <AppBlockingState
      icon="construct-outline"
      title={t('appConfig.maintenance.title')}
      body={t('appConfig.maintenance.body')}
      primaryLabel={t('appConfig.maintenance.retryButton')}
      primaryAccessibilityLabel={t('appConfig.maintenance.retryButtonAccessibility')}
      onPrimaryPress={() => void refreshConfig()}
      primaryLoading={isRefreshing}
      preventHardwareBack
    />
  );
}
