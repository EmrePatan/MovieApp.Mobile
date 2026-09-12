import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type TextVariant = 'hero' | 'title' | 'subtitle' | 'body' | 'bodySmall' | 'caption';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  muted?: boolean;
  center?: boolean;
}

const maxFontSizeMultipliers: Record<TextVariant, number> = {
  hero: 1.2,
  title: 1.25,
  subtitle: 1.3,
  body: 1.35,
  bodySmall: 1.35,
  caption: 1.4,
};

export function AppText({
  variant = 'body',
  muted = false,
  center = false,
  style,
  maxFontSizeMultiplier,
  ...props
}: AppTextProps) {
  return (
    <Text
      accessibilityRole="text"
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? maxFontSizeMultipliers[variant]}
      style={[
        typography[variant],
        styles.base,
        muted && styles.muted,
        center && styles.center,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
  muted: {
    color: colors.textSecondary,
  },
  center: {
    textAlign: 'center',
  },
});
