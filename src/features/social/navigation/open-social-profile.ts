import type { ImperativeRouter } from 'expo-router';
import { isUuid, normalizeRouteParam } from '@/features/navigation/normalize-route-param';

export function resolveSocialUserId(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const id = normalizeRouteParam(candidate ?? '');
    if (isUuid(id)) return id;
  }
  return null;
}

export type OpenSocialProfileOptions = {
  section?: 'library' | 'reviews';
};

export function openSocialProfile(
  router: ImperativeRouter,
  userIdCandidate: string | null | undefined,
  options?: OpenSocialProfileOptions,
): boolean {
  const userId = resolveSocialUserId(userIdCandidate);
  if (!userId) return false;
  if (options?.section === 'reviews') {
    router.push(`/user-comments/${userId}`);
    return true;
  }

  router.push(`/(tabs)/(app-shell)/social-profile/${userId}`);
  return true;
}
