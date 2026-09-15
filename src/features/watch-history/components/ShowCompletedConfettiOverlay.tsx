import { useEffect, useMemo } from 'react';
import { Animated, Dimensions, Easing, Modal, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

const CONFETTI_DURATION_MS = 1800;
const PARTICLE_COUNT = 54;

const PARTICLE_COLORS = [
  colors.progressCompleted,
  colors.success,
  colors.warning,
  '#7DD3FC',
  '#F9A8D4',
  '#FDE047',
  '#C4B5FD',
];

interface ParticleConfig {
  id: number;
  left: number;
  size: number;
  color: string;
  driftX: number;
  fallDistance: number;
  delay: number;
  spin: number;
  aspectRatio: number;
}

interface ShowCompletedConfettiOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

function createParticles(screenWidth: number, screenHeight: number): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    id: index,
    left: ((index * 41) % 97) + 1.5,
    size: 5 + (index % 4) * 2,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
    driftX: ((index % 13) - 6) * (screenWidth * 0.035),
    fallDistance: screenHeight * (0.55 + (index % 6) * 0.08),
    delay: (index % 10) * 55,
    spin: ((index % 7) - 3) * 120,
    aspectRatio: index % 2 === 0 ? 1 : 1.55,
  }));
}

function ConfettiParticle({
  particle,
  screenHeight,
}: {
  particle: ParticleConfig;
  screenHeight: number;
}) {
  const progress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 1800 + (particle.id % 4) * 220,
      delay: particle.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [particle.delay, particle.id, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, particle.driftX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenHeight * 0.08, particle.fallDistance],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.82, 1],
    outputRange: [0, 1, 1, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${particle.spin}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: `${particle.left}%`,
          width: particle.size,
          height: particle.size * particle.aspectRatio,
          backgroundColor: particle.color,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }],
        },
      ]}
    />
  );
}

export function ShowCompletedConfettiOverlay({
  visible,
  onDismiss,
}: ShowCompletedConfettiOverlayProps) {
  const { width, height } = Dimensions.get('window');
  const particles = useMemo(() => createParticles(width, height), [height, width]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const dismissTimer = setTimeout(onDismiss, CONFETTI_DURATION_MS);
    return () => {
      clearTimeout(dismissTimer);
    };
  }, [onDismiss, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      testID="show-completed-confetti"
    >
      <View style={styles.overlay} pointerEvents="none">
        {particles.map((particle) => (
          <ConfettiParticle key={particle.id} particle={particle} screenHeight={height} />
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  particle: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
