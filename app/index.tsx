import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { LoadingView } from '@/components/loading/LoadingView';

export default function IndexScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView message={t('common.startingApp')} />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
