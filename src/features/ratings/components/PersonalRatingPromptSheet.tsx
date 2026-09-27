import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { StarRatingSelector } from '@/features/ratings/components/StarRatingSelector';
import {
  backendScoreToStarRating,
  starRatingToBackendScore,
} from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface PersonalRatingPromptSheetProps {
  visible: boolean;
  /** Bumps when the sheet opens so content state resets without remounting on score fetch. */
  sessionKey: number;
  initialBackendScore?: number | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (backendScore: number) => void;
}

interface PersonalRatingPromptSheetContentProps
  extends Omit<PersonalRatingPromptSheetProps, 'visible'> {
  visible: boolean;
}

function PersonalRatingPromptSheetContent({
  visible,
  sessionKey,
  initialBackendScore = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PersonalRatingPromptSheetContentProps) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  const submittedSaveRef = useRef(false);
  const resetSessionRef = useRef(-1);

  useEffect(() => {
    if (!visible) {
      submittedSaveRef.current = false;
      resetSessionRef.current = -1;
      return;
    }

    if (resetSessionRef.current === sessionKey) {
      return;
    }

    resetSessionRef.current = sessionKey;
    setPreviewRating(null);
    setFeedback(null);
    submittedSaveRef.current = false;
  }, [visible, sessionKey]);

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
      submittedSaveRef.current = true;
      onSubmit(starRatingToBackendScore(previewRating));
    } catch {
      submittedSaveRef.current = false;
      setFeedback(t('ratings.saveError'));
    }
  };

  const hasPendingRating =
    previewRating != null || (isSubmitting && submittedSaveRef.current);

  const handleClear = () => {
    if (isSubmitting) {
      return;
    }

    setPreviewRating(null);
    setFeedback(null);
  };

  return (
    <View style={styles.overlay} testID="personal-rating-prompt-sheet">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        style={styles.backdrop}
        onPress={onClose}
      />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <AppText variant="subtitle" style={styles.title}>
          {t('ratings.promptSheet.title')}
        </AppText>
        <View style={styles.selectorRow} testID="star-rating-row">
          <StarRatingSelector
            value={committedStarRating}
            disabled={isSubmitting}
            onCommit={handleCommit}
            onClear={handleClear}
          />
        </View>
        <FeedbackMessage
          message={feedback}
          tone="error"
          onDismiss={() => setFeedback(null)}
        />
        <View style={styles.actionSlot}>
          <AppButton
            title={
              hasPendingRating
                ? t('ratings.promptSheet.save')
                : t('ratings.promptSheet.notNow')
            }
            variant={hasPendingRating ? 'primary' : 'ghost'}
            disabled={isSubmitting}
            onPress={handleSecondaryAction}
            testID={hasPendingRating ? 'personal-rating-save' : 'personal-rating-not-now'}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

export function PersonalRatingPromptSheet({
  visible,
  sessionKey,
  initialBackendScore = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PersonalRatingPromptSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <PersonalRatingPromptSheetContent
        visible={visible}
        sessionKey={sessionKey}
        initialBackendScore={initialBackendScore}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  selectorRow: {
    width: '100%',
    alignItems: 'center',
  },
  actionSlot: {
    width: '100%',
    minHeight: 48,
    justifyContent: 'center',
  },
});
