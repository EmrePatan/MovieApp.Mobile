import { Pressable, StyleSheet } from 'react-native';
import { Link, type LinkProps } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

interface AuthLinkProps {
  label: string;
  href?: LinkProps['href'];
  onPress?: () => void;
  accent?: boolean;
}

export function AuthLink({ label, href, onPress, accent = true }: AuthLinkProps) {
  const textStyle = accent ? styles.accent : styles.muted;

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={label}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <AppText variant="bodySmall" style={textStyle}>
            {label}
          </AppText>
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <AppText variant="bodySmall" style={textStyle}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accent: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
  muted: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
