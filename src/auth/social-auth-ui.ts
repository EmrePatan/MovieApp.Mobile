import { Platform } from 'react-native';
import { isAppleSocialAuthAvailable } from './social-auth-service';

export function shouldShowGoogleSocialAuthButton(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function shouldShowAppleSocialAuthButton(): boolean {
  return Platform.OS === 'ios' && isAppleSocialAuthAvailable();
}
