import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="verify-identity" />
      <Stack.Screen name="youre-in" />
    </Stack>
  );
}
