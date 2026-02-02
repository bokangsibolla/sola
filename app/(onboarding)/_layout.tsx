import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="destination" />
      <Stack.Screen name="trip-dates" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
