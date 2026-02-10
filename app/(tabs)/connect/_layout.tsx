import { Stack } from 'expo-router';

export default function ConnectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="thread/[id]" />
      <Stack.Screen name="new" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="user/[id]" />
      <Stack.Screen name="connections" />
      <Stack.Screen name="dm/index" />
      <Stack.Screen name="dm/[id]" />
    </Stack>
  );
}
