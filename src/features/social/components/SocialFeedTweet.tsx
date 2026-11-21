import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { ReviewStarRow } from '@/features/reviews/components/ReviewStarRow';
import { backendScoreToStarRating } from '@/features/ratings/utils/star-rating';
import { UserAvatar } from '@/components/common/UserAvatar';
import { SOCIAL_TWITTER_AVATAR, socialFeedSpacing, socialUi } from './social-ui-tokens';
import { socialFeedPremiumStyles } from './social-feed-premium-styles';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialFeedTweetProps {
  displayName: string;
  userName?: string | null;
  avatarUrl: string | null;
  timeLabel: string;
  contextLine?: string | null;
  onProfilePress: () => void;
  onPress?: () => void;
  onMenuPress?: () => void;
  menuLabel?: string;
  body: ReactNode;
  mediaCard?: ReactNode;
  footer?: ReactNode;
}

export function SocialFeedTweet({
  displayName,
  avatarUrl,
  timeLabel,
  contextLine,
  onProfilePress,
  onPress,
  onMenuPress,
  menuLabel,
  body,
  mediaCard,
  footer,
}: SocialFeedTweetProps) {
  const contextNode = contextLine ? (
    <AppText variant="caption" muted numberOfLines={2}>
      {contextLine}
    </AppText>
  ) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={displayName}
          onPress={onProfilePress}
          hitSlop={6}
          style={({ pressed }) => pressed && socialUi.pressed}
        >
          <View style={socialFeedPremiumStyles.avatarRing}>
            <UserAvatar
              displayName={displayName}
              effectiveAvatarUrl={avatarUrl}
              size={SOCIAL_TWITTER_AVATAR}
              textVariant="caption"
            />
          </View>
        </Pressable>
        <View style={styles.main}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={displayName}
              onPress={onProfilePress}
              hitSlop={4}
              style={({ pressed }) => [styles.headerLine, pressed && socialUi.pressed]}
            >
              <AppText variant="bodySmall" numberOfLines={1}>
                <AppText style={styles.name}>{displayName}</AppText>
                <AppText variant="caption" muted>
                  {` · ${timeLabel}`}
                </AppText>
              </AppText>
            </Pressable>
            {onMenuPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={menuLabel}
                onPress={onMenuPress}
                hitSlop={8}
                style={({ pressed }) => [styles.menu, pressed && socialUi.pressed]}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          {contextNode && onPress ? (
            <Pressable
              accessibilityRole="link"
              onPress={onPress}
              style={({ pressed }) => pressed && socialUi.pressed}
            >
              {contextNode}
            </Pressable>
          ) : (
            contextNode
          )}
          {onPress ? (
            <Pressable
              accessibilityRole="link"
              onPress={onPress}
              style={({ pressed }) => [styles.body, pressed && socialUi.pressed]}
            >
              {body}
            </Pressable>
          ) : (
            <View style={styles.body}>{body}</View>
          )}
          {mediaCard ? <View style={styles.media}>{mediaCard}</View> : null}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </View>
  );
}

export function SocialFeedTweetMediaCard({
  title,
  subtitle,
  kicker,
  kickerAccessory,
  ratingScore,
  children,
  onPress,
}: {
  title: string;
  subtitle?: string | null;
  kicker?: string | null;
  kickerAccessory?: ReactNode;
  ratingScore?: number | null;
  children: ReactNode;
  onPress: () => void;
}) {
  const showRating = ratingScore !== null && ratingScore !== undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && socialUi.pressed]}
    >
      {children}
      <View style={styles.cardText}>
        {kicker ? (
          <View style={styles.kickerRow}>
            <AppText variant="caption" muted numberOfLines={1} style={styles.kicker}>
              {kicker}
            </AppText>
            {kickerAccessory}
          </View>
        ) : null}
        <AppText variant="subtitle" style={styles.cardTitle} numberOfLines={2}>
          {title}
        </AppText>
        {subtitle || showRating ? (
          <View style={styles.subtitleRow}>
            {subtitle ? (
              <AppText variant="caption" muted numberOfLines={2} style={styles.subtitle}>
                {subtitle}
              </AppText>
            ) : null}
            {showRating ? (
              <ReviewStarRow starRating={backendScoreToStarRating(ratingScore!)} size={10} />
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: socialFeedSpacing.rowPaddingVertical,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  main: {
    flex: 1,
    gap: socialFeedSpacing.blockGap,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerLine: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '700',
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  menu: {
    padding: 2,
  },
  body: {
    paddingTop: 0,
  },
  media: {
    paddingTop: socialFeedSpacing.blockGap,
  },
  footer: {
    paddingTop: socialFeedSpacing.blockGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  cardText: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: socialFeedSpacing.blockGap,
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.surface,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  kicker: {
    flexShrink: 1,
  },
  cardTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  subtitle: {
    flexShrink: 1,
  },
});
