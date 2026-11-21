import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { SocialFollowStatus } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialProfileActionRowProps {
  followStatus: SocialFollowStatus;
  isFollowLoading: boolean;
  onFollowPress: () => void;
  onPrivacyPress?: () => void;
  onMessagePress?: () => void;
  isMessageLoading?: boolean;
  onBlockPress?: () => void;
  onReportPress?: () => void;
}

export function SocialProfileActionRow({
  followStatus,
  isFollowLoading,
  onFollowPress,
  onPrivacyPress,
  onMessagePress,
  isMessageLoading = false,
  onBlockPress,
  onReportPress,
}: SocialProfileActionRowProps) {
  const { t } = useTranslation();
  const isSelf = followStatus === 'Self';

  if (isSelf) {
    if (!onPrivacyPress) return null;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('social.managePrivacy')}
        onPress={onPrivacyPress}
        style={({ pressed }) => [styles.circleLight, pressed && styles.pressed]}
      >
        <Ionicons name="options-outline" size={18} color={colors.background} />
      </Pressable>
    );
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
      {onBlockPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.blockUser')}
          onPress={onBlockPress}
          style={({ pressed }) => [styles.circleDark, pressed && styles.pressed]}
        >
          <Ionicons name="ban-outline" size={16} color={colors.textPrimary} />
        </Pressable>
      ) : null}
      {onMessagePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.message')}
          disabled={isMessageLoading}
          onPress={onMessagePress}
          style={({ pressed }) => [styles.pill, styles.pillMuted, pressed && styles.pressed]}
        >
          {isMessageLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <AppText style={[styles.pillLabel, styles.pillLabelMuted]} numberOfLines={1}>
              {t('social.message')}
            </AppText>
          )}
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        disabled={isFollowLoading}
        onPress={onFollowPress}
        style={({ pressed }) => [
          styles.pill,
          following ? styles.pillMuted : styles.pillPrimary,
          pressed && styles.pressed,
        ]}
      >
        {isFollowLoading ? (
          <ActivityIndicator color={following ? colors.textPrimary : colors.background} />
        ) : (
          <AppText
            style={[styles.pillLabel, following ? styles.pillLabelMuted : styles.pillLabelPrimary]}
            numberOfLines={1}
          >
            {followLabel}
          </AppText>
        )}
      </Pressable>
      {onReportPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.reportUser')}
          onPress={onReportPress}
          style={({ pressed }) => [styles.circleDark, pressed && styles.pressed]}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.textPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pill: {
    minHeight: 36,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillPrimary: {
    backgroundColor: colors.textPrimary,
  },
  pillMuted: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  pillLabelPrimary: {
    color: colors.background,
  },
  pillLabelMuted: {
    color: colors.textPrimary,
  },
  circleLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
  },
  circleDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  pressed: {
    opacity: 0.88,
  },
});
