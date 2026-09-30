import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { isApiError } from '@/api/errors';
import {
  useRemoveAvatarMutation,
  useUploadAvatarMutation,
} from './useProfileMutations';
import type { UserProfileResponse } from '../types';

async function prepareSquareAvatar(uri: string): Promise<{ uri: string; name: string; type: string }> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    uri: manipulated.uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  };
}

export function useProfileAvatarEditor(profile: UserProfileResponse | undefined) {
  const { t } = useTranslation();
  const uploadAvatar = useUploadAvatarMutation();
  const removeAvatar = useRemoveAvatarMutation();

  const pickAndUpload = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('profile.avatarPermissionDenied'));
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]) {
      return;
    }

    try {
      const file = await prepareSquareAvatar(pickerResult.assets[0].uri);
      await uploadAvatar.mutateAsync(file);
      Alert.alert(t('profile.avatarUploadSuccess'));
    } catch (error) {
      Alert.alert(
        isApiError(error) ? error.userMessage : t('profile.avatarUploadFailed'),
      );
    }
  }, [t, uploadAvatar]);

  const removeCustomAvatar = useCallback(async () => {
    try {
      await removeAvatar.mutateAsync();
      Alert.alert(t('profile.avatarRemoveSuccess'));
    } catch (error) {
      Alert.alert(
        isApiError(error) ? error.userMessage : t('profile.avatarRemoveFailed'),
      );
    }
  }, [removeAvatar, t]);

  const openAvatarActions = useCallback(() => {
    const hasCustomAvatar = profile?.avatarKind === 'custom';
    const options = [t('profile.avatarChooseFromLibrary')];
    if (hasCustomAvatar) {
      options.push(t('profile.avatarRemove'));
    }
    options.push(t('common.cancel'));

    Alert.alert(t('profile.avatarEditTitle'), undefined, [
      { text: options[0], onPress: () => void pickAndUpload() },
      ...(hasCustomAvatar
        ? [{ text: options[1], style: 'destructive' as const, onPress: () => void removeCustomAvatar() }]
        : []),
      { text: options[options.length - 1], style: 'cancel' },
    ]);
  }, [pickAndUpload, profile?.avatarKind, removeCustomAvatar, t]);

  return {
    openAvatarActions,
    isAvatarBusy: uploadAvatar.isPending || removeAvatar.isPending,
  };
}
