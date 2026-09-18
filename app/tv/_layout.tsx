import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function TvLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
