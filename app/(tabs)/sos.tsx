import { Redirect } from 'expo-router';

// SOS tab is handled by a modal, not a screen.
// If someone navigates here directly, redirect to explore.
export default function SOSRedirect() {
  return <Redirect href="/(tabs)/explore" />;
}
