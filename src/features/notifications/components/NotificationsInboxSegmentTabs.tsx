import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { NotificationsInboxSegment } from '../types-inbox';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface NotificationsInboxSegmentTabsProps {
  active: NotificationsInboxSegment;
  onChange: (segment: NotificationsInboxSegment) => void;
  socialUnread?: number;
  releasesUnread?: number;
}

const SEGMENTS: NotificationsInboxSegment[] = ['releases', 'social'];


export function NotificationsInboxSegmentTabs({
  active,
  onChange,
  socialUnread = 0,
  releasesUnread = 0,
}: NotificationsInboxSegmentTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.outer} accessibilityRole="tablist">
      <View style={styles.row}>
        {SEGMENTS.map((segment) => {
          const isActive = segment === active;
          const unread = segment === 'social' ? socialUnread : releasesUnread;
          const label = t(`notifications.segments.${segment}`);
          const accessibilityLabel =
            unread > 0
              ? t('notifications.segments.accessibilityUnread', { label, count: unread })
              : label;

          return (
            <Pressable
              key={segment}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={accessibilityLabel}
              onPress={() => onChange(segment)}
              style={[styles.tab, isActive && styles.tabActive]}
              testID={`notifications-segment-${segment}`}
            >
              <View style={styles.tabLabelRow}>
                <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                  {label}
                </AppText>
                {unread > 0 ? <View style={styles.dot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.fill,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tabLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: premiumSheet.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: premiumSheet.textPrimary,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: premiumSheet.mutedGold,
  },
});
