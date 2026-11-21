import { resolveSocialActivityLabelKey } from './social-activity-label';

export function socialActivityHeadlineI18nKey(activityType: string): string {
  const labelKey = resolveSocialActivityLabelKey(activityType);
  return `social.activityHeadline.${labelKey}`;
}