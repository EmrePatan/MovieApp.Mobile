import { useId, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { AppText } from '@/components/common/AppText';
import { rememberAppShellTabOrigin } from '@/features/navigation/app-shell-tab-origin';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { computeLevel } from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';
import { useAchievementLevel } from '../useAchievementLevel';
import { AchievementLevelCard } from './AchievementLevelCard';
import { hexPath } from './AchievementMedal';

const SEAL = 28;

/** Gold hexagon carrying the level number: same shape language as the achievement medals. */
export function LevelSeal({ level, size = SEAL }: { level: number; size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const half = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`r${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor="#FFF3C9" />
            <Stop offset="0.5" stopColor="#D9B25A" />
            <Stop offset="1" stopColor="#7A5A18" />
          </LinearGradient>
        </Defs>
        <Path
          d={hexPath(half, half, half - 2)}
          fill={`url(#r${uid})`}
          stroke={`url(#r${uid})`}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path
          d={hexPath(half, half, half - 5)}
          fill="#17120A"
          stroke="#17120A"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </Svg>
      <AppText style={[styles.sealText, { fontSize: Math.round(size * (size < 24 ? 0.52 : 0.44)) }]}>{level}</AppText>
    </View>
  );
}

/** The signed-in user's level seal, sat next to their name; taps through to the achievements screen. */
export function OwnAchievementLevelBadge() {
  const router = useRouter();
  const level = useAchievementLevel();
  const { t, levelName } = useAchievementCopy();
  if (!level) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('achievements.level', { level: level.level })}, ${levelName(level.level)}`}
      hitSlop={8}
      onPress={() => {
        rememberAppShellTabOrigin('/library');
        router.push('/achievements');
      }}
      style={({ pressed }) => pressed && styles.pressed}
      testID="profile-level-badge"
    >
      <LevelSeal level={level.level} />
    </Pressable>
  );
}

/** Another member's level seal; taps open a small sheet with their level card. */
export function AchievementLevelBadge({ points }: { points: number | null | undefined }) {
  const [open, setOpen] = useState(false);
  const { t, levelName } = useAchievementCopy();
  const level = useMemo(() => (points == null ? null : computeLevel(points)), [points]);
  if (!level) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('achievements.level', { level: level.level })}, ${levelName(level.level)}`}
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={({ pressed }) => pressed && styles.pressed}
        testID="profile-level-badge"
      >
        <LevelSeal level={level.level} />
      </Pressable>
      <AppBottomSheet visible={open} onClose={() => setOpen(false)} testID="profile-level-sheet">
        <View style={styles.sheet}>
          <AchievementLevelCard level={level} />
        </View>
      </AppBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sealText: {
    position: 'absolute',
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    color: '#F6E2A8',
    fontVariant: ['tabular-nums'],
  },
  sheet: {
    paddingVertical: 20,
  },
  pressed: {
    opacity: 0.8,
  },
});
