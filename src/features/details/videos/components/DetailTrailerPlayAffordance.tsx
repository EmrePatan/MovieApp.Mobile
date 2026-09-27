import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DetailDirectionalFrame } from '@/features/details/shared/components/DetailDirectionalFrame';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

export const DETAIL_TRAILER_PLAY_BUTTON_SIZE = 68;
const PLAY_INNER_SIZE = DETAIL_TRAILER_PLAY_BUTTON_SIZE - 2;

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
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.buttonPressed,
        ]}
      >
        <DetailDirectionalFrame
          variant="gold"
          borderRadius={DETAIL_TRAILER_PLAY_BUTTON_SIZE / 2}
          style={styles.frame}
        >
          <View style={styles.iconSurface}>
            <Ionicons name="play" size={24} color={colors.textPrimary} style={styles.playIcon} />
          </View>
        </DetailDirectionalFrame>
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
  pressable: {
    minHeight: interaction.touchTarget,
    minWidth: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: DETAIL_TRAILER_PLAY_BUTTON_SIZE,
    height: DETAIL_TRAILER_PLAY_BUTTON_SIZE,
  },
  iconSurface: {
    width: PLAY_INNER_SIZE,
    height: PLAY_INNER_SIZE,
    borderRadius: PLAY_INNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  buttonPressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  playIcon: {
    marginLeft: 2,
  },
});
