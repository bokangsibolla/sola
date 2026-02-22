import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="collections/[id]" />
      <Stack.Screen name="admin-verifications" />
    </Stack>
  );
}
