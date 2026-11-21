import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
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
              style={styles.tab}
            >
              <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </AppText>
              <View style={[styles.indicator, isActive && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: socialFeedTheme.border,
    backgroundColor: socialFeedTheme.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tabLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: socialFeedTheme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  tabLabelActive: {
    color: socialFeedTheme.textPrimary,
  },
  indicator: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: socialFeedTheme.accent,
  },
});
