import { useMemo } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppBottomSheetChrome } from '@/components/layout/AppBottomSheet';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { borderRadius, spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
interface SocialProfileCoverPickerSheetProps {
  visible: boolean;
  posterPaths: string[];
  isBusy?: boolean;
  onClose: () => void;
  onPickPhoto: () => void;
  onPickPoster: (posterPath: string) => void;
  onRemoveCover: () => void;
}

const POSTER_W = 72;
const POSTER_H = 108;

export function SocialProfileCoverPickerSheet({
  visible,
  posterPaths,
  isBusy = false,
  onClose,
  onPickPhoto,
  onPickPoster,
  onRemoveCover,
}: SocialProfileCoverPickerSheetProps) {
  const { t } = useTranslation();
  const uniquePosters = useMemo(
    () => posterPaths.filter((path, index) => path?.trim() && posterPaths.indexOf(path) === index),
    [posterPaths],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <AppBottomSheetChrome
          onClose={onClose}
          title={t('social.profileCoverEdit')}
          subtitle={t('social.profileCoverEditHint')}
        >
          <AppButton title={t('social.profileCoverPickPhoto')} onPress={onPickPhoto} loading={isBusy} />
          {uniquePosters.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="caption" muted>
                {t('social.profileCoverFromActivity')}
              </AppText>
              <FlatList
                horizontal
                data={uniquePosters}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.posterRow}
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onPickPoster(item)}
                    disabled={isBusy}
                    style={({ pressed }) => [styles.posterBtn, pressed && styles.pressed]}
                  >
                    <CatalogImage path={item} width={POSTER_W} height={POSTER_H} accessibilityLabel="" />
                  </Pressable>
                )}
              />
            </View>
          ) : null}
          <AppButton
            title={t('social.profileCoverRemove')}
            variant="ghost"
            onPress={onRemoveCover}
            loading={isBusy}
          />
        </AppBottomSheetChrome>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    width: '100%',
  },
  posterRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  posterBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  pressed: {
    opacity: 0.88,
  },
});