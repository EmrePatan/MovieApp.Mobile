import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import {
  clampCoverScale,
  clampCoverTranslation,
  computeCoverCropRect,
  COVER_ASPECT,
  resolveCoverBaseScale,
  type CoverFrameInput,
} from '@/features/profile/utils/cover-crop';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export interface CroppedCoverFile {
  uri: string;
  name: string;
  type: string;
}

interface CoverAdjustModalProps {
  /** Image to frame; the modal is visible while this is set. */
  sourceUri: string | null;
  isSaving?: boolean;
  onCancel: () => void;
  onConfirm: (file: CroppedCoverFile) => void | Promise<void>;
}

const ZOOM_STEP = 0.4;
const OUTPUT_WIDTH = 1600;

export function CoverAdjustModal({
  sourceUri,
  isSaving = false,
  onCancel,
  onConfirm,
}: CoverAdjustModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [cropping, setCropping] = useState(false);

  const frameWidth = windowWidth - spacing.lg * 2;
  const frameHeight = Math.round(frameWidth / COVER_ASPECT);

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  useEffect(() => {
    if (!sourceUri) {
      return;
    }

    let cancelled = false;
    RNImage.getSize(
      sourceUri,
      (width, height) => {
        if (!cancelled) {
          setImageSize({ width, height });
        }
      },
      () => {
        if (!cancelled) {
          onCancel();
        }
      },
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load size once per framed source
  }, [sourceUri]);

  const frameInput: CoverFrameInput | null = useMemo(
    () =>
      imageSize
        ? {
            imageWidth: imageSize.width,
            imageHeight: imageSize.height,
            frameWidth,
            frameHeight,
          }
        : null,
    [frameHeight, frameWidth, imageSize],
  );

  const baseScale = frameInput ? resolveCoverBaseScale(frameInput) : 1;

  const gesture = useMemo(() => {
    if (!frameInput) {
      return Gesture.Manual();
    }

    const pan = Gesture.Pan()
      .onStart(() => {
        savedTx.set(tx.get());
        savedTy.set(ty.get());
      })
      .onUpdate((event) => {
        const next = clampCoverTranslation(
          frameInput,
          scale.get(),
          savedTx.get() + event.translationX,
          savedTy.get() + event.translationY,
        );
        tx.set(next.tx);
        ty.set(next.ty);
      });

    const pinch = Gesture.Pinch()
      .onStart(() => {
        savedScale.set(scale.get());
      })
      .onUpdate((event) => {
        const nextScale = clampCoverScale(savedScale.get() * event.scale);
        const next = clampCoverTranslation(frameInput, nextScale, tx.get(), ty.get());
        scale.set(nextScale);
        tx.set(next.tx);
        ty.set(next.ty);
      });

    return Gesture.Simultaneous(pan, pinch);
  }, [frameInput, savedScale, savedTx, savedTy, scale, tx, ty]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: scale.get() }],
  }));

  const zoomBy = useCallback(
    (delta: number) => {
      if (!frameInput) {
        return;
      }
      const nextScale = clampCoverScale(scale.get() + delta);
      const next = clampCoverTranslation(frameInput, nextScale, tx.get(), ty.get());
      scale.set(withTiming(nextScale, { duration: 160 }));
      tx.set(withTiming(next.tx, { duration: 160 }));
      ty.set(withTiming(next.ty, { duration: 160 }));
    },
    [frameInput, scale, tx, ty],
  );

  const handleConfirm = useCallback(async () => {
    if (!sourceUri || !frameInput) {
      return;
    }

    setCropping(true);
    try {
      const rect = computeCoverCropRect(frameInput, scale.get(), tx.get(), ty.get());
      const result = await ImageManipulator.manipulateAsync(
        sourceUri,
        [{ crop: rect }, { resize: { width: OUTPUT_WIDTH } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      await onConfirm({ uri: result.uri, name: 'cover.jpg', type: 'image/jpeg' });
    } catch {
      // Upload errors are surfaced by the mutation; keep the adjuster open so the user can retry.
    } finally {
      setCropping(false);
    }
  }, [frameInput, onConfirm, scale, sourceUri, tx, ty]);

  const busy = cropping || isSaving;

  return (
    <Modal visible={Boolean(sourceUri)} animationType="fade" onRequestClose={onCancel}>
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.screen, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.header}>
            <AppText variant="title">{t('profile.coverAdjustTitle')}</AppText>
            <AppText variant="bodySmall" muted>
              {t('profile.coverAdjustHint')}
            </AppText>
          </View>

          <View style={styles.stage}>
            <GestureDetector gesture={gesture}>
              <View style={[styles.frame, { width: frameWidth, height: frameHeight }]} testID="cover-adjust-frame">
                {sourceUri && frameInput ? (
                  <Animated.View
                    style={[
                      {
                        width: frameInput.imageWidth * baseScale,
                        height: frameInput.imageHeight * baseScale,
                      },
                      imageStyle,
                    ]}
                  >
                    <Image
                      source={{ uri: sourceUri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="fill"
                      accessibilityLabel={t('profile.coverAdjustTitle')}
                    />
                  </Animated.View>
                ) : (
                  <ActivityIndicator color={colors.accent} />
                )}
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(10,10,15,0.35)', 'rgba(10,10,15,0.15)', colors.background]}
                  locations={[0, 0.4, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View pointerEvents="none" style={styles.ghostAvatar} />
              </View>
            </GestureDetector>

            <View style={styles.zoomRow}>
              <GlassSurface style={styles.zoomButton}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('profile.coverZoomOut')}
                  onPress={() => zoomBy(-ZOOM_STEP)}
                  style={styles.zoomHit}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </Pressable>
              </GlassSurface>
              <GlassSurface style={styles.zoomButton}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('profile.coverZoomIn')}
                  onPress={() => zoomBy(ZOOM_STEP)}
                  style={styles.zoomHit}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </Pressable>
              </GlassSurface>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton
              title={t('common.saveChanges')}
              onPress={() => void handleConfirm()}
              loading={busy}
              disabled={busy || !frameInput}
            />
            <AppButton title={t('common.cancel')} variant="ghost" onPress={onCancel} disabled={busy} />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#120E16',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  ghostAvatar: {
    position: 'absolute',
    left: spacing.lg,
    bottom: -38,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(10,10,15,0.55)',
  },
  zoomRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  zoomHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});
