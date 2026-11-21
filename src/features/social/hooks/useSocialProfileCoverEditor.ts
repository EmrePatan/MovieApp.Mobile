import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  removeSocialProfileCover,
  setSocialProfileCoverPoster,
  uploadSocialProfileCover,
} from '../api/social-api';
import { socialQueryKeys } from './social-query-keys';

async function prepareCoverImage(uri: string) {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );
  return { uri: manipulated.uri, name: 'cover.jpg', type: 'image/jpeg' };
}

export function useSocialProfileCoverEditor(userId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
  }, [queryClient, userId]);

  const uploadCover = useMutation({
    mutationFn: uploadSocialProfileCover,
    onSuccess: invalidate,
    onError: () => Alert.alert(t('social.operationFailed'), t('social.profileCoverUpdateFailed')),
  });

  const setPoster = useMutation({
    mutationFn: setSocialProfileCoverPoster,
    onSuccess: invalidate,
    onError: () => Alert.alert(t('social.operationFailed'), t('social.profileCoverUpdateFailed')),
  });

  const removeCover = useMutation({
    mutationFn: removeSocialProfileCover,
    onSuccess: invalidate,
    onError: () => Alert.alert(t('social.operationFailed'), t('social.profileCoverUpdateFailed')),
  });

  const pickAndUploadPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('profile.avatarPermissionDenied'));
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 1],
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]) {
      return;
    }

    const file = await prepareCoverImage(pickerResult.assets[0].uri);
    await uploadCover.mutateAsync(file);
  }, [t, uploadCover]);

  const isBusy = uploadCover.isPending || setPoster.isPending || removeCover.isPending;

  return {
    pickAndUploadPhoto,
    setPoster: (posterPath: string) => setPoster.mutate(posterPath),
    removeCover: () => removeCover.mutate(),
    isBusy,
  };
}