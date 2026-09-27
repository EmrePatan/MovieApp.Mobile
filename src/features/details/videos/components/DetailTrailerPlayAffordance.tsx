import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { shadows } from '@/theme/shadows';
import { borderRadius } from '@/theme/spacing';

export const DETAIL_TRAILER_PLAY_BUTTON_SIZE = 68;

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
        <Ionicons name="play" size={24} color={colors.textPrimary} style={styles.playIcon} />
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
    width: DETAIL_TRAILER_PLAY_BUTTON_SIZE,
    height: DETAIL_TRAILER_PLAY_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(196, 163, 90, 0.72)',
    ...shadows.accentGlow,
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
