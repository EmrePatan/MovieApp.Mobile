import { Stack } from 'expo-router';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';
import { colors } from '@/theme/colors';

export default function SocialProfileUserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        ...detailChildStackScreenOptions,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="watchlist/[watchlistId]" />
    </Stack>
  );
}
