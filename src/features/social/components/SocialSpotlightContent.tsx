import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { SocialFeedItem } from '../types';
import { SOCIAL_POSTER } from './social-ui-tokens';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialSpotlightContentProps {
  item: Pick<
    SocialFeedItem,
    'posterPath' | 'targetTitle' | 'targetSubtitle' | 'ratingScore' | 'reviewExcerpt'
  >;
  typeLabel?: string;
}

export const SocialSpotlightContent = memo(function SocialSpotlightContent({
  item,
  typeLabel,
}: SocialSpotlightContentProps) {
  const { t } = useTranslation();
  const title = item.targetTitle || t('social.contentFallback');

  return (
    <View style={styles.row}>
      <View style={styles.posterShadow}>
        <View style={styles.posterFrame}>
          <CatalogImage
            path={item.posterPath}
            width={SOCIAL_POSTER.width}
            height={SOCIAL_POSTER.height}
            accessibilityLabel={t('common.posterAccessibility', { title })}
          />
        </View>
      </View>
      <View style={styles.copy}>
        {typeLabel ? (
          <View style={styles.typeChip}>
            <AppText variant="caption" style={styles.typeChipText} numberOfLines={1}>
              {typeLabel.toUpperCase()}
            </AppText>
          </View>
        ) : null}
        <AppText variant="subtitle" style={styles.title} numberOfLines={3}>
          {title}
        </AppText>
        {item.targetSubtitle ? (
          <AppText variant="caption" style={styles.subtitle} numberOfLines={2}>
            {item.targetSubtitle}
          </AppText>
        ) : null}
        {item.ratingScore !== null ? (
          <View style={styles.ratingBadge}>
            <AppText variant="bodySmall" style={styles.ratingValue}>
              {item.ratingScore.toFixed(1)}
            </AppText>
            <AppText variant="caption" style={styles.ratingOf}>
              /10
            </AppText>
          </View>
        ) : null}
        {item.reviewExcerpt ? (
          <AppText variant="bodySmall" style={styles.quote} numberOfLines={4}>
            “{item.reviewExcerpt}”
          </AppText>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  posterShadow: {
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.45,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  posterFrame: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: 2,
  },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  typeChipText: {
    color: colors.accentStrong,
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 10,
  },
  title: {
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.35,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    alignSelf: 'flex-start',
    gap: 2,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
  },
  ratingValue: {
    fontWeight: '800',
    color: colors.accentStrong,
  },
  ratingOf: {
    color: colors.textMuted,
  },
  quote: {
    color: colors.textSecondary,
    lineHeight: 21,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});