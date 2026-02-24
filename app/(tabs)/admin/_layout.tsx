import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="verifications" />
      <Stack.Screen name="content-reports" />
      <Stack.Screen name="user-reports" />
    </Stack>
  );
}
