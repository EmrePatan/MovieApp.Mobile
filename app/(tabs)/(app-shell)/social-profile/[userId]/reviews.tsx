import { useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';

/** Legacy nested route — redirects to the same chrome as My Comments. */
export default function SocialProfileReviewsRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId: string | string[] }>();
  const userId = useMemo(() => normalizeRouteParam(params.userId), [params.userId]);

  useEffect(() => {
    if (!userId) return;
    router.replace(`/user-comments/${userId}`);
  }, [router, userId]);

  return null;
}
