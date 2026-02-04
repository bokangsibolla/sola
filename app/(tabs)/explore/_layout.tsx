import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="search"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="see-all" />
      <Stack.Screen name="country/[slug]" />
      <Stack.Screen name="city/[slug]" />
      <Stack.Screen name="collection/[slug]" />
      <Stack.Screen name="activity/[slug]" />
      <Stack.Screen name="place-detail/[id]" />
    </Stack>
  );
}
