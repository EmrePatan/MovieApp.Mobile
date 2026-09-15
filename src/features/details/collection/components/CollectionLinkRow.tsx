import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { buildCollectionDetailRoute } from '@/features/details/shared/routes';
import type { CollectionSummary } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface CollectionLinkRowProps {
  collection: CollectionSummary | null;
}

const POSTER_WIDTH = 40;
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * 1.5);

export const CollectionLinkRow = memo(function CollectionLinkRow({
  collection,
}: CollectionLinkRowProps) {
  const router = useRouter();

  if (!collection) {
    return null;
  }

  const handlePress = () => {
    router.push(buildCollectionDetailRoute(collection.tmdbId));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Part of ${collection.name}`}
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID="collection-link-row"
    >
      <CatalogImage
        path={collection.posterPath}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        accessibilityLabel={`${collection.name} poster`}
      />
      <View style={styles.labelRow}>
        <AppText variant="bodySmall" numberOfLines={1} style={styles.label}>
          Part of {collection.name}
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: layout.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  labelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    flex: 1,
  },
});
