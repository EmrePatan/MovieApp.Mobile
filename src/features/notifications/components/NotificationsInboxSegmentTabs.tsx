import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { NotificationsInboxSegment } from '../types-inbox';
import { colors } from '@/theme/colors';
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(196, 163, 90, 0.14)',
    backgroundColor: colors.background,
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabActive: {
    borderBottomColor: premiumSheet.goldBorder,
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
