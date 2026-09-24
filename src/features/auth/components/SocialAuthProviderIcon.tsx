import { Ionicons } from '@expo/vector-icons';
import type { SocialAuthProvider } from '@/models/api/auth';
import { colors } from '@/theme/colors';

interface SocialAuthProviderIconProps {
  provider: SocialAuthProvider;
  size?: number;
}

export function SocialAuthProviderIcon({ provider, size = 22 }: SocialAuthProviderIconProps) {
  if (provider === 'google') {
    return (
      <Ionicons
        name="logo-google"
        size={size}
        color="#4285F4"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  return (
    <Ionicons
      name="logo-apple"
      size={size}
      color={colors.textPrimary}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
