import { Platform } from 'react-native';

export function shouldShowGoogleSocialAuthButton(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function shouldShowAppleSocialAuthButton(): boolean {
  return Platform.OS === 'ios';
}
