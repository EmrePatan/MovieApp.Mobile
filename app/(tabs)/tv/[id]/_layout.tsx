import { Stack } from 'expo-router';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

export default function TvShowDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={ratedDetailStackScreenOptions} />
      <Stack.Screen name="season/[seasonNumber]" />
      <Stack.Screen name="season/[seasonNumber]/episode/[episodeNumber]" />
    </Stack>
  );
}
