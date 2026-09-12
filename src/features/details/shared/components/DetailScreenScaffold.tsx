import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface DetailBackButtonProps {
  label?: string;
}

export function DetailBackButton({ label = 'Back' }: DetailBackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.back()}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      <AppText variant="body">{label}</AppText>
    </Pressable>
  );
}

interface DetailScreenScaffoldProps {
  children: ReactNode;
}

export function DetailScreenScaffold({ children }: DetailScreenScaffoldProps) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
