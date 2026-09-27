import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { borderRadius, spacing } from '@/theme/spacing';

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
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="play" size={22} color={colors.textPrimary} style={styles.playIcon} />
        </View>
        <AppText variant="caption" style={styles.label}>
          {t('details.actions.trailerButton')}
        </AppText>
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
  button: {
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: interaction.touchTarget,
    minWidth: interaction.touchTarget,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: interaction.subtlePressedOpacity,
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
  },
  playIcon: {
    marginLeft: 2,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
