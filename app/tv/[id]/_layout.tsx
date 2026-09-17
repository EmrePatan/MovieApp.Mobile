import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
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
      <Stack.Screen name="reviews" options={detailChildStackScreenOptions} />
      <Stack.Screen name="credits" options={detailChildStackScreenOptions} />
      <Stack.Screen name="gallery" options={detailChildStackScreenOptions} />
      <Stack.Screen name="season/[seasonNumber]" />
      <Stack.Screen name="season/[seasonNumber]/episode/[episodeNumber]" />
    </Stack>
  );
}
