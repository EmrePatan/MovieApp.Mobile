import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { borderRadius } from '@/theme/spacing';

interface DetailTrailerPlayAffordanceProps {
  onPress: () => void;
}

export function DetailTrailerPlayAffordance({ onPress }: DetailTrailerPlayAffordanceProps) {
  const { t } = useTranslation();

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Pressable
        testID="detail-trailer-play-affordance"
        accessibilityRole="button"
        accessibilityLabel={t('details.actions.playTrailer')}
        onPress={onPress}
        style={({ pressed }) => [styles.iconCircle, pressed && styles.buttonPressed]}
      >
        <Ionicons name="play" size={22} color={colors.textPrimary} style={styles.playIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    minHeight: interaction.touchTarget,
    minWidth: interaction.touchTarget,
  },
  buttonPressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  playIcon: {
    marginLeft: 2,
  },
});
