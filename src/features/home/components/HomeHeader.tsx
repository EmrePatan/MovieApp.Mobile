import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

export function HomeHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppText variant="hero" accessibilityRole="header">
        MovieApp
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={() => router.push('/(tabs)/profile')}
        style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
      >
        <Ionicons name="person-circle-outline" size={32} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileButton: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
});
