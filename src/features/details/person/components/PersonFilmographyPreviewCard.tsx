import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { PersonFilmographyEntry } from '../types';
import { spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface PersonFilmographyPreviewCardProps {
  entry: PersonFilmographyEntry;
  busy?: boolean;
  onPress: (entry: PersonFilmographyEntry) => void;
}

function formatYear(releaseDate: string | null): string | null {
  if (!releaseDate) {
    return null;
  }

  const year = releaseDate.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

export function PersonFilmographyPreviewCard({
  entry,
  busy = false,
  onPress,
}: PersonFilmographyPreviewCardProps) {
  const { t } = useTranslation();
  const year = formatYear(entry.releaseDate);
  const accessibilityLabel = year
    ? t('common.itemWithDetails', { title: entry.title, details: year })
    : entry.title;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={busy}
      onPress={() => onPress(entry)}
      style={styles.container}
      testID={`person-filmography-preview-${entry.mediaType}-${entry.tmdbId}`}
    >
      <PosterImage
        uri={entry.posterPath}
        width={layout.posterCarousel.width}
        height={layout.posterCarousel.height}
        accessibilityLabel={t('common.posterAccessibility', { title: entry.title })}
      />
      <AppText variant="caption" numberOfLines={2} style={styles.title}>
        {entry.title}
      </AppText>
      {year ? (
        <AppText variant="caption" muted>
          {year}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: layout.posterCarousel.width,
    gap: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
});
