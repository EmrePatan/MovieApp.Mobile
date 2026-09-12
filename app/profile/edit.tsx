import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const profileQuery = useCurrentProfile();
  const updateProfile = useUpdateProfileMutation();
  const [displayName, setDisplayName] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<UpdateProfileFormErrors>({});
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

  useEffect(() => {
    if (!hasInitialized && profileQuery.data?.displayName) {
      setDisplayName(profileQuery.data.displayName);
      setHasInitialized(true);
    }
  }, [hasInitialized, profileQuery.data?.displayName]);

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
          setFeedback({ message: 'Profile updated successfully.', tone: 'success' });
          setTimeout(() => router.back(), 800);
        },
        onError: (error) => {
          setFeedback({
            message: isApiError(error)
              ? error.userMessage
              : 'Could not update profile. Please try again.',
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
        <AppText variant="title">Edit Profile</AppText>
        <AppText variant="bodySmall" muted>
          Update your display name.
        </AppText>

        <FeedbackMessage
          message={feedback?.message ?? null}
          tone={feedback?.tone}
          onDismiss={() => setFeedback(null)}
        />

        <View style={styles.form}>
          <AppInput
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            error={fieldErrors.displayName}
            maxLength={100}
            autoCapitalize="words"
          />
          <AppButton
            title="Save changes"
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
