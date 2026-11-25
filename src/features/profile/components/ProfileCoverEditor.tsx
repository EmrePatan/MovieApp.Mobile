import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { CoverAdjustModal, type CroppedCoverFile } from '@/features/profile/components/CoverAdjustModal';
import { useOwnProfileCover } from '@/features/profile/hooks/useOwnProfileCover';
import { COVER_ASPECT } from '@/features/profile/utils/cover-crop';
import { SocialProfileCoverPickerSheet } from '@/features/social/components/SocialProfileCoverPickerSheet';
import { useSocialProfileCoverEditor } from '@/features/social/hooks/useSocialProfileCoverEditor';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { resolveImageUri } from '@/utils/image-url';

/**
 * Cover preview at the exact profile aspect ratio. Choosing a photo or poster
 * opens the adjuster so the user frames what the profile will show.
 */
export function ProfileCoverEditor() {
  const { t } = useTranslation();
  const { userId, coverUri, isCustomPhotoCover, shelfPosters } = useOwnProfileCover();
  const coverEditor = useSocialProfileCoverEditor(userId);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [adjustUri, setAdjustUri] = useState<string | null>(null);

  const handlePickPhoto = async () => {
    setSheetVisible(false);
    const uri = await coverEditor.pickPhotoUri();
    if (uri) {
      setAdjustUri(uri);
    }
  };

  const handlePickPoster = (path: string) => {
    setSheetVisible(false);
    setAdjustUri(resolveImageUri(path, 'w1280'));
  };

  const handleConfirm = async (file: CroppedCoverFile) => {
    await coverEditor.uploadCroppedCover(file);
    setAdjustUri(null);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('social.profileCoverEdit')}
        onPress={() => setSheetVisible(true)}
        disabled={coverEditor.isBusy}
        style={styles.frame}
        testID="profile-cover-preview"
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={isCustomPhotoCover ? 'center' : 'top'}
            cachePolicy="memory-disk"
            accessibilityElementsHidden
          />
        ) : (
          <LinearGradient
            colors={['#2A1F18', '#141018', colors.background]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(10,10,15,0.35)', 'rgba(10,10,15,0.15)', colors.background]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <GlassSurface style={styles.changeChip}>
          <View style={styles.changeChipInner}>
            {coverEditor.isBusy ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Ionicons name="image-outline" size={16} color={colors.textPrimary} />
            )}
            <AppText style={styles.changeLabel} numberOfLines={1}>
              {t('social.profileCoverEdit')}
            </AppText>
          </View>
        </GlassSurface>
      </Pressable>

      <SocialProfileCoverPickerSheet
        visible={sheetVisible}
        posterPaths={shelfPosters}
        isBusy={coverEditor.isBusy}
        onClose={() => setSheetVisible(false)}
        onPickPhoto={() => void handlePickPhoto()}
        onPickPoster={handlePickPoster}
        onRemoveCover={() => {
          coverEditor.removeCover();
          setSheetVisible(false);
        }}
      />

      <CoverAdjustModal
        key={adjustUri ?? 'closed'}
        sourceUri={adjustUri}
        isSaving={coverEditor.isUploading}
        onCancel={() => setAdjustUri(null)}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  frame: {
    width: '100%',
    aspectRatio: COVER_ASPECT,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#120E16',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  changeChip: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    height: 34,
    borderRadius: 17,
  },
  changeChipInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  changeLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
