import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import type { SocialProfile } from '../types';
import { socialFeedSpacing, socialUi } from './social-ui-tokens';
import { authTypography } from '@/features/auth/auth-typography';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const PROFILE_AVATAR = 64;

function CountLink({
  value,
  label,
  valueStyle,
  labelStyle,
  onPress,
}: {
  value: number;
  label: string;
  valueStyle: object;
  labelStyle: object | undefined;
  onPress?: () => void;
}) {
  const content = (
    <>
      <AppText style={[styles.countValue, valueStyle]}>
        {value}
      </AppText>
      <AppText muted style={[styles.countWord, labelStyle]}>
        {label}
      </AppText>
    </>
  );

  if (!onPress) {
    return <View style={styles.countInline}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.countInline, pressed && socialUi.pressed]}
    >
      {content}
    </Pressable>
  );
}

interface SocialProfileIdentityProps {
  profile: SocialProfile;
  memberSinceLabel: string;
  onDark?: boolean;
  hideAvatar?: boolean;
  reviewsCount?: number;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
}

export function SocialProfileIdentity({
  profile,
  memberSinceLabel,
  onDark = false,
  hideAvatar = false,
  reviewsCount,
  onFollowersPress,
  onFollowingPress,
}: SocialProfileIdentityProps) {
  const { t } = useTranslation();

  const subtle = onDark ? styles.subtleOnDark : undefined;
  const countNumStyle = onDark ? styles.countNumOnDark : styles.countNum;

  return (
    <View style={[styles.wrap, hideAvatar && styles.wrapPremium, onDark && styles.wrapOnDark]}>
      {!hideAvatar ? (
        <UserAvatar
          displayName={profile.displayName}
          effectiveAvatarUrl={profile.avatarUrl}
          size={PROFILE_AVATAR}
          textVariant="subtitle"
          accessibilityLabel={profile.displayName}
        />
      ) : null}
      <View style={[styles.copy, hideAvatar && styles.copyPremium]}>
        <AppText variant="title" style={[styles.name, onDark && styles.nameOnDark]} numberOfLines={2}>
          {profile.displayName}
        </AppText>
        <AppText variant="bodySmall" muted={!onDark} style={subtle} numberOfLines={1}>
          @{profile.userName}
        </AppText>
        <View style={styles.counts}>
          <CountLink
            value={profile.followersCount}
            label={t('social.followersCountLabel')}
            valueStyle={countNumStyle}
            labelStyle={subtle}
            onPress={onFollowersPress}
          />
          <CountLink
            value={profile.followingCount}
            label={t('social.followingCountLabel')}
            valueStyle={countNumStyle}
            labelStyle={subtle}
            onPress={onFollowingPress}
          />
          {reviewsCount != null ? (
            <CountLink
              value={reviewsCount}
              label={t('social.reviewCount')}
              valueStyle={countNumStyle}
              labelStyle={subtle}
            />
          ) : null}
        </View>
        <View style={styles.sinceRow}>
          <Ionicons name="calendar-outline" size={13} color={onDark ? 'rgba(255,255,255,0.55)' : colors.textMuted} />
          <AppText variant="caption" muted={!onDark} style={subtle} numberOfLines={1}>
            {memberSinceLabel}
          </AppText>
        </View>
        {profile.isPrivate ? (
          <View style={styles.privateRow}>
            <Ionicons name="lock-closed-outline" size={13} color={onDark ? 'rgba(255,255,255,0.55)' : colors.textMuted} />
            <AppText variant="caption" muted={!onDark} style={subtle}>
              {t('social.privateProfile')}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: socialFeedSpacing.tabPaddingTop,
    paddingBottom: socialFeedSpacing.profileHeaderPaddingBottom,
  },
  wrapPremium: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  copyPremium: {
    width: '100%',
    gap: 2,
  },
  wrapOnDark: {
    paddingTop: 0,
    paddingBottom: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: socialFeedSpacing.blockGap,
    paddingTop: 0,
  },
  name: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  nameOnDark: {
    color: colors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  subtleOnDark: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  countInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minHeight: 32,
  },
  countValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  countWord: {
    fontSize: 16,
    lineHeight: 22,
    textTransform: 'lowercase',
  },


  sinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  countNum: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  countNumOnDark: {
    fontWeight: '700',
    color: colors.accent,
  },
  privateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});