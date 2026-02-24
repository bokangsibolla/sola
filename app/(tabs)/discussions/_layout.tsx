import { Stack } from 'expo-router';

export default function DiscussionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="thread/[id]" />
      <Stack.Screen name="new" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
