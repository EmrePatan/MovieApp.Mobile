import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { AppBottomSheetChrome } from '@/components/layout/AppBottomSheet';
import { StarRatingSelector } from '@/features/ratings/components/StarRatingSelector';
import {
  backendScoreToStarRating,
  starRatingToBackendScore,
} from '@/features/ratings/utils/star-rating';
import { spacing } from '@/theme/spacing';

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
    <AppBottomSheetChrome
      onClose={onClose}
      title={t('ratings.promptSheet.title')}
      align="center"
      testID="personal-rating-prompt-sheet"
    >
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
    </AppBottomSheetChrome>
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
