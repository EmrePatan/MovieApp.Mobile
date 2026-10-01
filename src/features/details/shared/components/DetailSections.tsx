import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CollapsibleText } from '@/components/common/CollapsibleText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { translateGenreName } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DetailMetaItemProps {
  label: string;
  value: string;
}

export function DetailMetaItem({ label, value }: DetailMetaItemProps) {
  return (
    <View style={styles.item} accessibilityRole="text">
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="bodySmall">{value}</AppText>
    </View>
  );
}

interface DetailGenresProps {
  genres: string[];
}

const DETAIL_KEYWORD_CHIP_LIMIT = 12;

interface DetailKeywordsProps {
  keywords: string[];
}

export function DetailKeywords({ keywords }: DetailKeywordsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (keywords.length === 0) {
    return null;
  }

  const visibleKeywords =
    expanded || keywords.length <= DETAIL_KEYWORD_CHIP_LIMIT
      ? keywords
      : keywords.slice(0, DETAIL_KEYWORD_CHIP_LIMIT);
  const hiddenCount = keywords.length - visibleKeywords.length;

  return (
    <View style={styles.section}>
      <HomeSectionHeader title={t('details.sections.keywords')} />
      <View style={[styles.body, styles.genreRow]}>
        {visibleKeywords.map((keyword) => (
          <View key={keyword} style={styles.genreChip} accessibilityRole="text">
            <AppText variant="caption">{keyword}</AppText>
          </View>
        ))}
      </View>
      {hiddenCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('details.sections.showMoreKeywords', { count: hiddenCount })}
          onPress={() => setExpanded(true)}
          style={styles.keywordToggle}
        >
          <AppText variant="caption" muted>
            {t('details.sections.showMoreKeywords', { count: hiddenCount })}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function DetailGenres({ genres }: DetailGenresProps) {
  const { t } = useTranslation();

  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader title={t('details.sections.genres')} />
      <View style={[styles.body, styles.genreRow]}>
        {genres.map((genre) => (
          <View key={genre} style={styles.genreChip}>
            <AppText variant="caption">{translateGenreName(genre)}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

interface DetailOverviewProps {
  overview: string | null;
  /** When true, omits section top margin (e.g. directly after header stack). */
  compactTop?: boolean;
}

export function DetailOverview({ overview, compactTop = false }: DetailOverviewProps) {
  const { t } = useTranslation();

  if (!overview) {
    return null;
  }

  return (
    <View
      style={[
        styles.section,
        styles.overviewSection,
        compactTop && styles.sectionCompactTop,
      ]}
    >
      <HomeSectionHeader
        title={t('details.sections.overview')}
        compactSpacing
      />
      <CollapsibleText
        text={overview}
        style={styles.body}
        textStyle={styles.overviewText}
        toggleTestID="detail-overview-toggle"
      />
    </View>
  );
}

interface DetailExternalIdsProps {
  tmdbId: number | null;
  tvdbId: number | null;
  imdbId: string | null;
}

export function DetailExternalIds({ tmdbId, tvdbId, imdbId }: DetailExternalIdsProps) {
  const items = [
    tmdbId != null ? `TMDB ${tmdbId}` : null,
    tvdbId != null ? `TVDB ${tvdbId}` : null,
    imdbId ? `IMDb ${imdbId}` : null,
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="caption" muted>
        {items.join(' • ')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionCompactTop: {
    marginTop: 0,
  },
  overviewSection: {
    gap: spacing.xs,
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  overviewText: {
    lineHeight: 24,
  },
  item: {
    gap: 2,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  keywordToggle: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
});
