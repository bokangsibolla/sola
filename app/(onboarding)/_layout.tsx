import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="day-style" />
      <Stack.Screen name="priorities" />
      <Stack.Screen name="stay-preference" />
      <Stack.Screen name="spending-style" />
      <Stack.Screen name="youre-in" />
    </Stack>
  );
}
