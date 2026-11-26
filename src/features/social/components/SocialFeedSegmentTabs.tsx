import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SegmentedPillTabs } from '@/components/common/SegmentedPillTabs';
import { spacing } from '@/theme/spacing';

export type SocialFeedSegment = 'forYou' | 'following';

interface SocialFeedSegmentTabsProps {
  active: SocialFeedSegment;
  onChange: (segment: SocialFeedSegment) => void;
}

const SEGMENTS: SocialFeedSegment[] = ['forYou', 'following'];

export function SocialFeedSegmentTabs({ active, onChange }: SocialFeedSegmentTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.outer}>
      <SegmentedPillTabs
        options={SEGMENTS.map((segment) => ({
          value: segment,
          label: t(`social.feedTabs.${segment}`),
        }))}
        value={active}
        onChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
