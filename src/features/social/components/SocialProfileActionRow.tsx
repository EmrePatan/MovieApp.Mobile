import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import type { SocialFollowStatus } from '../types';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';

/** Same 40pt control size as the cover chrome buttons and the own-profile actions. */
const CONTROL = 44;
const BUTTON = 44;

interface SocialProfileActionRowProps {
  followStatus: SocialFollowStatus;
  isFollowLoading: boolean;
  onFollowPress: () => void;
  onMessagePress?: () => void;
  isMessageLoading?: boolean;
  onBlockPress?: () => void;
  onReportPress?: () => void;
}

interface IconControlProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
  testID?: string;
}

/** Flat 40pt glass circle with a single icon. */
function IconControl({ icon, label, onPress, loading = false, testID }: IconControlProps) {
  return (
    <View style={styles.circle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={loading}
        onPress={onPress}
        style={({ pressed }) => [styles.circleHit, pressed && styles.pressed]}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Ionicons name={icon} size={19} color={colors.textPrimary} />
        )}
      </Pressable>
    </View>
  );
}

/** Follow / message / more. Only the call to action ("Follow") keeps a label; the rest are icons. */
export function SocialProfileActionRow({
  followStatus,
  isFollowLoading,
  onFollowPress,
  onMessagePress,
  isMessageLoading = false,
  onBlockPress,
  onReportPress,
}: SocialProfileActionRowProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isSelf = followStatus === 'Self';

  if (isSelf) {
    // Own profile is handled on the bottom Profile tab; no social actions here.
    return null;
  }

  const followLabel =
    followStatus === 'Accepted'
      ? t('social.unfollow')
      : followStatus === 'Pending'
        ? t('social.cancelFollowRequest')
        : t('social.follow');

  const following = followStatus === 'Accepted' || followStatus === 'Pending';

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        disabled={isFollowLoading}
        onPress={onFollowPress}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        testID="social-profile-follow"
      >
        {isFollowLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <>
            <Ionicons
              name={
                followStatus === 'Pending'
                  ? 'time'
                  : following
                    ? 'person-remove'
                    : 'person-add'
              }
              size={17}
              color={colors.background}
            />
            <AppText style={styles.primaryLabel} numberOfLines={1}>
              {followLabel}
            </AppText>
          </>
        )}
      </Pressable>
      {onMessagePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.message')}
          disabled={isMessageLoading}
          onPress={onMessagePress}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          testID="social-profile-message"
        >
          {isMessageLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.textPrimary} />
              <AppText style={styles.secondaryLabel} numberOfLines={1}>
                {t('social.message')}
              </AppText>
            </>
          )}
        </Pressable>
      ) : null}
      {onBlockPress || onReportPress ? (
        <IconControl
          icon="ellipsis-horizontal"
          label={t('social.moreActions')}
          onPress={() => setMenuOpen(true)}
          testID="social-profile-more"
        />
      ) : null}
      <AppBottomSheet visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <View style={styles.menu}>
          {onReportPress ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMenuOpen(false);
                onReportPress();
              }}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            >
              <Ionicons name="flag-outline" size={20} color={colors.textPrimary} />
              <AppText style={styles.menuLabel}>{t('social.reportUser')}</AppText>
            </Pressable>
          ) : null}
          {onBlockPress ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMenuOpen(false);
                onBlockPress();
              }}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            >
              <Ionicons name="ban-outline" size={20} color={colors.error} />
              <AppText style={[styles.menuLabel, { color: colors.error }]}>
                {t('social.blockUser')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  primary: {
    flex: 1.25,
    height: BUTTON,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentStrong,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  secondary: {
    flex: 1,
    height: BUTTON,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  circle: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: CONTROL / 2,
    overflow: 'hidden',
    backgroundColor: glass.panelElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  circleHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.88,
  },
});
