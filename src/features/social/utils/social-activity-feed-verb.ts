import { resolveSocialActivityLabelKey } from './social-activity-label';

export function socialActivityFeedVerbI18nKey(activityType: string): string {
  const labelKey = resolveSocialActivityLabelKey(activityType);
  return `social.feedVerb.${labelKey}`;
}