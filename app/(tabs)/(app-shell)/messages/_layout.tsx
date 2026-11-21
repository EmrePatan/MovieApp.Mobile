import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[conversationId]" />
    </Stack>
  );
}
