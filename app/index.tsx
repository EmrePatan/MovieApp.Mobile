import { Redirect } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { LoadingView } from '@/components/loading/LoadingView';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView message="Starting MovieApp..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
