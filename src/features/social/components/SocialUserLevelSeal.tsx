import { LevelSeal } from '@/features/achievements/components/AchievementLevelBadge';
import { computeLevel } from '@/features/achievements/achievement-model';
import { useSocialProfile } from '../hooks/useSocialQueries';

interface SocialUserLevelSealProps {
  userId: string | null | undefined;
  size?: number;
}

/**
 * Small level seal for lists and feed rows. Reads the member's cached public profile, so
 * authors that repeat in a list cost one request; renders nothing when their level is hidden.
 */
export function SocialUserLevelSeal({ userId, size = 20 }: SocialUserLevelSealProps) {
  const profile = useSocialProfile(userId ?? '');
  const points = profile.data?.achievementPoints;
  if (points == null) return null;
  return <LevelSeal level={computeLevel(points).level} size={size} />;
}
