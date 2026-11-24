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
    // The system image picker needs no library permission for images (Expo ImagePicker docs).
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
  }, [uploadCover]);

  /** Picks a photo without the system cropper so the in-app adjuster can frame it. */
  const pickPhotoUri = useCallback(async (): Promise<string | null> => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]) {
      return null;
    }

    return pickerResult.assets[0].uri;
  }, []);

  const uploadCroppedCover = useCallback(
    async (file: { uri: string; name: string; type: string }) => {
      await uploadCover.mutateAsync(file);
    },
    [uploadCover],
  );

  const isBusy = uploadCover.isPending || setPoster.isPending || removeCover.isPending;

  return {
    pickAndUploadPhoto,
    pickPhotoUri,
    uploadCroppedCover,
    isUploading: uploadCover.isPending,
    setPoster: (posterPath: string) => setPoster.mutate(posterPath),
    removeCover: () => removeCover.mutate(),
    isBusy,
  };
}