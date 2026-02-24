import { Stack } from 'expo-router';

export default function TravelersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user/[id]" />
      <Stack.Screen name="connections" />
      <Stack.Screen name="dm/index" />
      <Stack.Screen name="dm/[id]" />
      <Stack.Screen name="together/[postId]" />
      <Stack.Screen name="together/new" />
    </Stack>
  );
}
