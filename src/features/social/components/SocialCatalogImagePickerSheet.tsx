import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { GalleryFilterTabs } from '@/features/gallery/components/GalleryFilterTabs';
import type { GalleryFilter, GalleryImage, GalleryResponse } from '@/features/gallery/types';
import { getMovieTvGalleryImages } from '@/features/gallery/utils/gallery-images';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialCatalogImagePickerSheetProps {
  visible: boolean;
  gallery: GalleryResponse | null | undefined;
  isLoading?: boolean;
  onClose: () => void;
  onSelect: (filePath: string) => void;
}

const COLUMNS = 3;
const GAP = spacing.sm;

export function SocialCatalogImagePickerSheet({
  visible,
  gallery,
  isLoading = false,
  onClose,
  onSelect,
}: SocialCatalogImagePickerSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<GalleryFilter>('all');

  const images = useMemo<GalleryImage[]>(() => {
    if (!gallery) return [];
    return getMovieTvGalleryImages(gallery, filter);
  }, [filter, gallery]);

  const tileSize = Math.floor(
    (width - premiumSheet.contentPaddingH * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={premiumSheetChrome.overlay}>
        <Pressable style={premiumSheetChrome.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, premiumSheet.contentPaddingBottom) }]}>
          <View style={premiumSheetChrome.handle} />
          <View style={styles.header}>
            <AppText variant="subtitle" style={styles.headerTitle}>{t('social.pickPhoto')}</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.cancel')}
              onPress={onClose}
              hitSlop={8}
              style={styles.close}
            >
              <AppText style={styles.closeLabel}>{t('social.cancel')}</AppText>
            </Pressable>
          </View>

          <GalleryFilterTabs activeFilter={filter} onFilterChange={setFilter} />

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={premiumSheet.mutedGold} />
            </View>
          ) : images.length === 0 ? (
            <View style={styles.centered}>
              <AppText muted center>
                {t('gallery.empty')}
              </AppText>
            </View>
          ) : (
            <FlatList
              data={images}
              keyExtractor={(item, index) => `${item.category}-${item.filePath}-${index}`}
              numColumns={COLUMNS}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('social.pickPhoto')}
                  onPress={() => {
                    onSelect(item.filePath);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.tile,
                    { width: tileSize, height: tileSize },
                    pressed && styles.pressed,
                  ]}
                >
                  <CatalogImage path={item.filePath} width={tileSize} height={tileSize} />
                  <View style={styles.badge}>
                    <AppText variant="caption" style={styles.badgeText}>
                      {item.category === 'backdrop'
                        ? t('gallery.filters.backdrops')
                        : t('gallery.filters.posters')}
                    </AppText>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    maxHeight: '78%',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
  close: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  closeLabel: {
    color: premiumSheet.mutedGold,
    fontWeight: '600',
  },
  list: {
    paddingBottom: spacing.lg,
    gap: GAP,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  tile: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: premiumSheet.secondary,
  },
  badge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(10,10,15,0.72)',
  },
  badgeText: {
    color: premiumSheet.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  centered: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pressed: {
    opacity: 0.88,
  },
});
