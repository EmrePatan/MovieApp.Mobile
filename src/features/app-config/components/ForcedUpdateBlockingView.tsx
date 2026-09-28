import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { AppBlockingState } from '@/components/blocking/AppBlockingState';
import { useAppConfig } from '../hooks/useAppConfig';

export function ForcedUpdateBlockingView() {
  const { t } = useTranslation();
  const { evaluation } = useAppConfig();

  const handleUpdate = () => {
    const url = evaluation.storeUrl;
    if (url) {
      void Linking.openURL(url);
    }
  };

  return (
    <AppBlockingState
      icon="arrow-up-circle-outline"
      title={t('appConfig.forcedUpdate.title')}
      body={t('appConfig.forcedUpdate.body')}
      primaryLabel={t('appConfig.forcedUpdate.updateButton')}
      primaryAccessibilityLabel={t('appConfig.forcedUpdate.updateButtonAccessibility')}
      onPrimaryPress={handleUpdate}
      preventHardwareBack
    />
  );
}
