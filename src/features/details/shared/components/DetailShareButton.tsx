import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { DetailNeutralIconControl } from './DetailNeutralIconControl';
import { useCatalogShare } from '@/features/sharing/useCatalogShare';
import type { CatalogShareContentType } from '@/features/sharing/build-catalog-share-url';

interface DetailShareButtonProps {
  contentType: CatalogShareContentType;
  contentId: string;
  title: string;
  releaseDate?: string | null;
  firstAirDate?: string | null;
  topOffset: number;
}

export function DetailShareButton({
  contentType,
  contentId,
  title,
  releaseDate,
  firstAirDate,
  topOffset,
}: DetailShareButtonProps) {
  const { t } = useTranslation();
  const shareCatalog = useCatalogShare();

  const handleShare = useCallback(() => {
    void shareCatalog({
      contentType,
      contentId,
      title,
      releaseDate,
      firstAirDate,
    });
  }, [contentId, contentType, firstAirDate, releaseDate, shareCatalog, title]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('sharing.share')}
      onPress={handleShare}
      testID="detail-share-button"
      style={({ pressed }) => [
        styles.button,
        { top: topOffset },
        pressed && styles.pressed,
      ]}
    >
      <DetailNeutralIconControl>
        <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
      </DetailNeutralIconControl>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 20,
    minWidth: interaction.touchTarget,
    minHeight: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
