import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { MAX_REVIEW_CONTENT_LENGTH } from '../types';
import {
  hasReviewValidationErrors,
  validateReviewContent,
  type ReviewFormErrors,
} from '../utils/review-validation';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ReviewComposerProps {
  initialContent?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}

export function ReviewComposer({
  initialContent = '',
  submitLabel,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}: ReviewComposerProps) {
  const [content, setContent] = useState(initialContent);
  const [fieldErrors, setFieldErrors] = useState<ReviewFormErrors>({});

  useEffect(() => {
    if (initialContent !== content && initialContent.length > 0 && content === '') {
      setContent(initialContent);
    }
  }, [content, initialContent]);

  const handleSubmit = () => {
    const errors = validateReviewContent(content);
    setFieldErrors(errors);

    if (hasReviewValidationErrors(errors)) {
      return;
    }

    onSubmit(content.trim());
  };

  return (
    <View style={styles.container}>
      <FeedbackMessage
        message={errorMessage}
        tone="error"
        onDismiss={undefined}
      />
      <AppText variant="bodySmall" style={styles.label}>
        Review
      </AppText>
      <TextInput
        accessibilityLabel="Review"
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Share your thoughts..."
        placeholderTextColor={colors.textMuted}
        maxLength={MAX_REVIEW_CONTENT_LENGTH}
        style={[styles.input, fieldErrors.content && styles.inputError]}
        textAlignVertical="top"
      />
      <View style={styles.footer}>
        <AppText variant="caption" muted>
          {content.length}/{MAX_REVIEW_CONTENT_LENGTH}
        </AppText>
        {fieldErrors.content ? (
          <AppText variant="caption" style={styles.error} accessibilityRole="alert">
            {fieldErrors.content}
          </AppText>
        ) : null}
      </View>
      <View style={styles.actions}>
        {onCancel ? (
          <AppButton title="Cancel" variant="ghost" disabled={isSubmitting} onPress={onCancel} />
        ) : null}
        <AppButton
          title={submitLabel}
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
  },
  input: {
    minHeight: 120,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
  },
  inputError: {
    borderColor: colors.error,
  },
  footer: {
    gap: spacing.xs,
  },
  error: {
    color: colors.error,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
