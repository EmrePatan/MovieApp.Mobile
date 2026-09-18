import { Platform } from 'react-native';

export function shouldShowGoogleSocialAuthButton(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function shouldShowAppleSocialAuthButton(): boolean {
  // Show on all iOS builds; availability is validated when the user taps the button.
  // Android must never show an empty Apple slot.
  return Platform.OS === 'ios';
}
