import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppInput } from '@/components/inputs/AppInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useUpdateProfileMutation } from '@/features/profile/hooks/useProfileMutations';
import {
  hasProfileValidationErrors,
  validateUpdateProfile,
  type UpdateProfileFormErrors,
} from '@/features/profile/utils/profile-validation';
import { spacing } from '@/theme/spacing';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profileQuery = useCurrentProfile();
  const updateProfile = useUpdateProfileMutation();
  const profileDisplayName = profileQuery.data?.displayName ?? '';
  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);
  const displayName = displayNameDraft ?? profileDisplayName;
  const [fieldErrors, setFieldErrors] = useState<UpdateProfileFormErrors>({});
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

  const handleSubmit = () => {
    const errors = validateUpdateProfile(displayName);
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors)) {
      return;
    }

    updateProfile.mutate(
      { displayName: displayName.trim() },
      {
        onSuccess: () => {
          setFeedback({ message: t('profile.profileUpdated'), tone: 'success' });
          setTimeout(() => router.back(), 800);
        },
        onError: (error) => {
          setFeedback({
            message: isApiError(error)
              ? error.userMessage
              : t('profile.profileUpdateFailed'),
            tone: 'error',
          });
        },
      },
    );
  };

  return (
    <Screen scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <DetailBackButton />
        <AppText variant="title">{t('profile.editProfileTitle')}</AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.editProfileHint')}
        </AppText>

        <FeedbackMessage
          message={feedback?.message ?? null}
          tone={feedback?.tone}
          onDismiss={() => setFeedback(null)}
        />

        <View style={styles.form}>
          <AppInput
            label={t('auth.displayName')}
            value={displayName}
            onChangeText={setDisplayNameDraft}
            error={fieldErrors.displayName}
            maxLength={100}
            autoCapitalize="words"
          />
          <AppButton
            title={t('common.saveChanges')}
            loading={updateProfile.isPending}
            disabled={updateProfile.isPending}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
