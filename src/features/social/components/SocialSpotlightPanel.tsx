import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { SocialFeedItem } from '../types';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

const POSTER_WIDTH = layout.posterCatalogRow.width;
const POSTER_HEIGHT = layout.posterCatalogRow.height;

interface SocialSpotlightPanelProps {
  item: Pick<
    SocialFeedItem,
    'posterPath' | 'targetTitle' | 'targetSubtitle' | 'targetContentType' | 'ratingScore' | 'reviewExcerpt'
  >;
  titleFallback?: string;
}

function contentTypeLabel(
  type: SocialFeedItem['targetContentType'],
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (type === 'Movie') return t('social.contentType.movie');
  if (type === 'TvShow') return t('social.contentType.tvShow');
  return t('social.contentType.episode');
}

export const SocialSpotlightPanel = memo(function SocialSpotlightPanel({
  item,
  titleFallback,
}: SocialSpotlightPanelProps) {
  const { t } = useTranslation();
  const title = item.targetTitle || titleFallback || t('social.contentFallback');
  const typeLabel = contentTypeLabel(item.targetContentType, t);

  return (
    <View style={styles.panel}>
      <CatalogImage
        path={item.posterPath}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        accessibilityLabel={t('common.posterAccessibility', { title })}
      />
      <View style={styles.meta}>
        <View style={styles.badgeRow}>
          {item.ratingScore !== null ? (
            <View style={styles.ratingBadge}>
              <AppText variant="caption" style={styles.ratingText}>
                ★ {item.ratingScore.toFixed(1)}
              </AppText>
            </View>
          ) : null}
          <View style={styles.typeBadge}>
            <AppText variant="caption" muted>
              {typeLabel}
            </AppText>
          </View>
        </View>
        <AppText variant="subtitle" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>
        {item.targetSubtitle ? (
          <AppText variant="bodySmall" muted numberOfLines={2}>
            {item.targetSubtitle}
          </AppText>
        ) : null}
        {item.reviewExcerpt ? (
          <AppText variant="bodySmall" muted numberOfLines={4} style={styles.excerpt}>
            {item.reviewExcerpt}
          </AppText>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: glass.panelElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentTint14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
  },
  ratingText: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: glass.panelInput,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  excerpt: {
    lineHeight: 20,
  },
});