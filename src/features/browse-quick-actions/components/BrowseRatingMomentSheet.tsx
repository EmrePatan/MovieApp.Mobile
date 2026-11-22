import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Modal, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { AppBottomSheetChrome } from '@/components/layout/AppBottomSheet';
import { StarRatingSelector } from '@/features/ratings/components/StarRatingSelector';
import {
  backendScoreToStarRating,
  starRatingToBackendScore,
} from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface BrowseRatingMomentSheetProps {
  visible: boolean;
  sessionKey: number;
  title: string;
  posterUrl: string | null;
  initialBackendScore?: number | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (backendScore: number) => void;
}

export function BrowseRatingMomentSheet({
  visible,
  sessionKey,
  title,
  posterUrl,
  initialBackendScore = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: BrowseRatingMomentSheetProps) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  const [submittedSave, setSubmittedSave] = useState(false);
  const resetSessionRef = useRef(-1);
  const [heroOpacity] = useState(() => new Animated.Value(0));
  const [heroTranslate] = useState(() => new Animated.Value(8));

  useEffect(() => {
    if (!visible) {
      setSubmittedSave(false);
      resetSessionRef.current = -1;
      heroOpacity.setValue(0);
      heroTranslate.setValue(8);
      return;
    }

    if (resetSessionRef.current !== sessionKey) {
      resetSessionRef.current = sessionKey;
      setPreviewRating(null);
      setFeedback(null);
      setSubmittedSave(false);
    }

    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslate, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, sessionKey, heroOpacity, heroTranslate]);

  const committedStarRating =
    initialBackendScore != null ? backendScoreToStarRating(initialBackendScore) : null;

  const handleCommit = (starRating: number) => {
    if (isSubmitting) {
      return;
    }
    setPreviewRating(starRating);
    setFeedback(null);
  };

  const handleSecondaryAction = () => {
    if (isSubmitting) {
      return;
    }

    if (previewRating == null) {
      onClose();
      return;
    }

    try {
      setSubmittedSave(true);
      onSubmit(starRatingToBackendScore(previewRating));
    } catch {
      setSubmittedSave(false);
      setFeedback(t('ratings.saveError'));
    }
  };

  const hasPendingRating =
    previewRating != null || (isSubmitting && submittedSave);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <AppBottomSheetChrome
          onClose={onClose}
          align="center"
          testID="browse-rating-moment-sheet"
        >
          <Animated.View
            style={[
              styles.hero,
              { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] },
            ]}
          >
            <PosterImage
              uri={posterUrl}
              width={64}
              height={96}
              accessibilityLabel={t('common.posterAccessibility', { title })}
              elevated
            />
            <View style={styles.heroCopy}>
              <AppText variant="caption" muted style={styles.eyebrow}>
                {t('browseQuickActions.ratingEyebrow')}
              </AppText>
              <AppText variant="subtitle" numberOfLines={2} style={styles.title}>
                {title}
              </AppText>
              <AppText variant="bodySmall" muted style={styles.prompt}>
                {t('browseQuickActions.ratingPrompt')}
              </AppText>
            </View>
          </Animated.View>

          <View style={styles.selectorRow} testID="star-rating-row">
            <StarRatingSelector
              value={committedStarRating}
              disabled={isSubmitting}
              onCommit={handleCommit}
              onClear={() => {
                if (!isSubmitting) {
                  setPreviewRating(null);
                  setFeedback(null);
                }
              }}
            />
          </View>

          <FeedbackMessage
            message={feedback}
            tone="error"
            onDismiss={() => setFeedback(null)}
          />

          <View style={styles.actions}>
            <AppButton
              title={
                hasPendingRating
                  ? t('ratings.promptSheet.save')
                  : t('browseQuickActions.ratingLater')
              }
              variant={hasPendingRating ? 'primary' : 'ghost'}
              disabled={isSubmitting}
              onPress={handleSecondaryAction}
              testID={hasPendingRating ? 'browse-rating-save' : 'browse-rating-later'}
            />
          </View>
        </AppBottomSheetChrome>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  title: {
    letterSpacing: 0.15,
  },
  prompt: {
    lineHeight: 20,
  },
  selectorRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actions: {
    width: '100%',
    minHeight: 48,
    justifyContent: 'center',
  },
});
