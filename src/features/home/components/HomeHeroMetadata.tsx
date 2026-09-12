import { StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { ContentType } from '@/models/api/pagination';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';

interface HomeHeroMetadataProps {
  contentType: ContentType;
  releaseDate: string | null;
  voteAverage: number;
}

export function HomeHeroMetadata({
  contentType,
  releaseDate,
  voteAverage,
}: HomeHeroMetadataProps) {
  const parts = [
    formatContentType(contentType),
    formatCatalogYear(releaseDate, null),
    voteAverage > 0 ? `★ ${formatRating(voteAverage)}` : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return (
    <AppText
      variant="bodySmall"
      style={styles.meta}
      numberOfLines={1}
      accessibilityLabel={parts.join(', ')}
    >
      {parts.join('  •  ')}
    </AppText>
  );
}

const styles = StyleSheet.create({
  meta: {
    color: 'rgba(245, 245, 247, 0.9)',
    letterSpacing: 0.25,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
