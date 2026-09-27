import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { WholeStarRatingPicker } from '@/features/ratings/components/WholeStarRatingPicker';
import {
  backendScoreToStarRating,
  starRatingToBackendScore,
} from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface PersonalRatingPromptSheetProps {
  visible: boolean;
  initialBackendScore?: number | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (backendScore: number) => void;
}

interface PersonalRatingPromptSheetContentProps
  extends Omit<PersonalRatingPromptSheetProps, 'visible'> {}

function PersonalRatingPromptSheetContent({
  initialBackendScore = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PersonalRatingPromptSheetContentProps) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(() =>
    initialBackendScore != null ? backendScoreToStarRating(initialBackendScore) : null,
  );

  const handleSelect = (stars: number) => {
    if (isSubmitting) {
      return;
    }

    setSelectedStars(stars);
    setFeedback(null);

    try {
      onSubmit(starRatingToBackendScore(stars));
    } catch {
      setFeedback(t('ratings.saveError'));
    }
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
        <WholeStarRatingPicker
          value={selectedStars}
          disabled={isSubmitting}
          onSelect={handleSelect}
        />
        <FeedbackMessage
          message={feedback}
          tone="error"
          onDismiss={() => setFeedback(null)}
        />
        <AppButton
          title={t('ratings.promptSheet.notNow')}
          variant="ghost"
          disabled={isSubmitting}
          onPress={onClose}
          testID="personal-rating-not-now"
        />
      </SafeAreaView>
    </View>
  );
}

export function PersonalRatingPromptSheet({
  visible,
  initialBackendScore = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PersonalRatingPromptSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <PersonalRatingPromptSheetContent
          key={String(initialBackendScore ?? 'unset')}
          initialBackendScore={initialBackendScore}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
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
});
