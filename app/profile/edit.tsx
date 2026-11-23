import { useMemo, useState } from 'react';
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
import { ProfileAvatarEditor } from '@/features/profile/components/ProfileAvatarEditor';
import { ProfileCoverEditor } from '@/features/profile/components/ProfileCoverEditor';
import { ProfileSocialLinksEditor } from '@/features/profile/components/ProfileSocialLinksEditor';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useUpdateProfileMutation } from '@/features/profile/hooks/useProfileMutations';
import type { ProfileSocialPlatform } from '@/features/profile/types';
import {
  PROFILE_BIO_MAX,
  serializeSocialLinksForUpdate,
  socialLinksToDraft,
} from '@/features/profile/utils/profile-social-links';
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
  const profile = profileQuery.data;

  const profileDisplayName = profile?.displayName ?? '';
  const profileBio = profile?.bio ?? '';
  const profileLinksDraft = useMemo(
    () => socialLinksToDraft(profile?.socialLinks),
    [profile?.socialLinks],
  );

  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);
  const [bioDraft, setBioDraft] = useState<string | null>(null);
  const [linksDraft, setLinksDraft] = useState<Record<ProfileSocialPlatform, string> | null>(null);
  const displayName = displayNameDraft ?? profileDisplayName;
  const bio = bioDraft ?? profileBio;
  const socialLinks = linksDraft ?? profileLinksDraft;

  const [fieldErrors, setFieldErrors] = useState<UpdateProfileFormErrors>({});
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );

  const handleLinkChange = (platform: ProfileSocialPlatform, value: string) => {
    setLinksDraft((prev) => ({
      ...(prev ?? profileLinksDraft),
      [platform]: value,
    }));
  };

  const handleSubmit = () => {
    const errors = validateUpdateProfile(displayName, bio, socialLinks);
    setFieldErrors(errors);

    if (hasProfileValidationErrors(errors)) {
      return;
    }

    updateProfile.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim() ? bio.trim() : null,
        socialLinks: serializeSocialLinksForUpdate(socialLinks),
      },
      {
        onSuccess: () => {
          // No success banner: returning to the updated profile is the confirmation.
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/profile');
          }
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

        <ProfileCoverEditor />
        <ProfileAvatarEditor />

        <View style={styles.form}>
          <AppInput
            label={t('auth.displayName')}
            value={displayName}
            onChangeText={setDisplayNameDraft}
            error={fieldErrors.displayName}
            maxLength={100}
            autoCapitalize="words"
          />

          <AppInput
            label={t('profile.profileAbout')}
            value={bio}
            onChangeText={setBioDraft}
            error={fieldErrors.bio}
            maxLength={PROFILE_BIO_MAX}
            multiline
            textAlignVertical="top"
            placeholder={t('profile.profileAboutPlaceholder')}
            style={styles.bioInput}
          />

          <ProfileSocialLinksEditor
            values={socialLinks}
            errors={fieldErrors.socialLinks}
            onChange={handleLinkChange}
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
  bioInput: {
    minHeight: 96,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});
