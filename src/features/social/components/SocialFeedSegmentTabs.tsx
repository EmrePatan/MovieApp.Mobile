import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

export type SocialFeedSegment = 'forYou' | 'following';

interface SocialFeedSegmentTabsProps {
  active: SocialFeedSegment;
  onChange: (segment: SocialFeedSegment) => void;
}

const SEGMENTS: SocialFeedSegment[] = ['forYou', 'following'];

export function SocialFeedSegmentTabs({ active, onChange }: SocialFeedSegmentTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.outer} accessibilityRole="tablist">
      <View style={styles.row}>
        {SEGMENTS.map((segment) => {
          const isActive = segment === active;
          const label = t(`social.feedTabs.${segment}`);
          return (
            <Pressable
              key={segment}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
              onPress={() => onChange(segment)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    gap: 2,
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  tab: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: socialFeedTheme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  tabLabelActive: {
    color: socialFeedTheme.textPrimary,
  },
});
