import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadNotificationCount';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

interface HomeHeaderProps {
  overlay?: boolean;
}

function formatUnreadBadgeCount(unreadCount: number): string | null {
  if (unreadCount <= 0) {
    return null;
  }

  if (unreadCount > 9) {
    return '9+';
  }

  return String(unreadCount);
}

export function HomeHeader({ overlay = false }: HomeHeaderProps) {
  const router = useRouter();
  const unreadCountQuery = useUnreadNotificationCount();
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const badgeLabel = formatUnreadBadgeCount(unreadCount);
  const notificationsAccessibilityLabel =
    badgeLabel == null
      ? 'Open notifications'
      : `Open notifications, ${badgeLabel} unread`;

  return (
    <View style={[styles.container, overlay && styles.containerOverlay]}>
      <AppText
        variant={overlay ? 'bodySmall' : 'title'}
        accessibilityRole="header"
        style={overlay ? styles.overlayTitle : undefined}
      >
        MovieApp
      </AppText>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={notificationsAccessibilityLabel}
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => [
            styles.iconButton,
            overlay && styles.iconButtonOverlay,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={overlay ? 24 : 26}
            color={colors.textPrimary}
          />
          {badgeLabel ? (
            <View style={styles.badge} accessibilityLabel={`${badgeLabel} unread notifications`}>
              <AppText variant="caption" style={styles.badgeText}>
                {badgeLabel}
              </AppText>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push('/(tabs)/profile')}
          style={({ pressed }) => [
            styles.iconButton,
            overlay && styles.iconButtonOverlay,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={overlay ? 26 : 30}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  containerOverlay: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  overlayTitle: {
    color: 'rgba(245, 245, 247, 0.88)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonOverlay: {
    minWidth: 40,
    minHeight: 40,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
});
