import { Stack, useLocalSearchParams } from 'expo-router';
import { TvShowCompletionCelebrationLayer } from '@/features/details/tv/components/TvShowCompletionCelebrationLayer';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
import { ratedDetailStackScreenOptions } from '@/features/details/shared/navigation/detail-stack-options';
import { colors } from '@/theme/colors';

export default function TvShowDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tvShowId = typeof id === 'string' ? id : '';

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          freezeOnBlur: false,
        }}
      >
        <Stack.Screen name="index" options={ratedDetailStackScreenOptions} />
        <Stack.Screen
          name="reviews"
          options={{ ...detailChildStackScreenOptions, headerBackButtonMenuEnabled: false }}
        />
        <Stack.Screen name="credits" options={detailChildStackScreenOptions} />
        <Stack.Screen name="gallery" options={detailChildStackScreenOptions} />
        <Stack.Screen name="season/[seasonNumber]" />
        <Stack.Screen name="season/[seasonNumber]/episode/[episodeNumber]" />
      </Stack>
      {tvShowId ? <TvShowCompletionCelebrationLayer tvShowId={tvShowId} /> : null}
    </>
  );
}
