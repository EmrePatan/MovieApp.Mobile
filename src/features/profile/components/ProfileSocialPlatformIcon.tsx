import { FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import type { ProfileSocialPlatform } from '../types';
import { colors } from '@/theme/colors';

interface ProfileSocialPlatformIconProps {
  platform: ProfileSocialPlatform;
  size?: number;
  color?: string;
}

export function ProfileSocialPlatformIcon({
  platform,
  size = 18,
  color = colors.textPrimary,
}: ProfileSocialPlatformIconProps) {
  switch (platform) {
    case 'x':
      return <FontAwesome6 name="x-twitter" size={size} color={color} />;
    case 'instagram':
      return <Ionicons name="logo-instagram" size={size} color={color} />;
    case 'snapchat':
      return <FontAwesome5 name="snapchat-ghost" size={size} color={color} solid />;
    case 'tiktok':
      return <Ionicons name="logo-tiktok" size={size} color={color} />;
    case 'youtube':
      return <Ionicons name="logo-youtube" size={size} color={color} />;
    case 'twitch':
      return <Ionicons name="logo-twitch" size={size} color={color} />;
    case 'threads':
      return <FontAwesome6 name="threads" size={size} color={color} />;
    case 'website':
      return <Ionicons name="globe-outline" size={size} color={color} />;
    default:
      return <Ionicons name="link-outline" size={size} color={color} />;
  }
}
