import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
import { colors } from '@/theme/colors';

export default function EpisodeDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        freezeOnBlur: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="reviews"
        options={{ ...detailChildStackScreenOptions, headerBackButtonMenuEnabled: false }}
      />
    </Stack>
  );
}
