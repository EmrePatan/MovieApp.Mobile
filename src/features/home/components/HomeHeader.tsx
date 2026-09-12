import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

interface HomeHeaderProps {
  overlay?: boolean;
}

export function HomeHeader({ overlay = false }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.container, overlay && styles.containerOverlay]}>
      <AppText
        variant={overlay ? 'bodySmall' : 'title'}
        accessibilityRole="header"
        style={overlay ? styles.overlayTitle : undefined}
      >
        MovieApp
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={() => router.push('/(tabs)/profile')}
        style={({ pressed }) => [
          styles.profileButton,
          overlay && styles.profileButtonOverlay,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="person-circle-outline"
          size={overlay ? 26 : 30}
          color={colors.textPrimary}
        />
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  containerOverlay: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  overlayTitle: {
    color: 'rgba(245, 245, 247, 0.88)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  profileButton: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonOverlay: {
    minWidth: 40,
    minHeight: 40,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
});
