import { ActionSheetIOS, Linking, Platform } from 'react-native';

/** Open a single location in Google Maps. */
export function getGoogleMapsUrl(
  lat: number,
  lng: number,
  name?: string,
  googlePlaceId?: string,
): string {
  const base = 'https://www.google.com/maps/search/?api=1';
  const query = name ? encodeURIComponent(name) : `${lat},${lng}`;
  const placeParam = googlePlaceId ? `&query_place_id=${googlePlaceId}` : '';
  return `${base}&query=${query}${placeParam}`;
}

/** Open a single location in Apple Maps. */
export function getAppleMapsUrl(lat: number, lng: number, name?: string): string {
  const q = name ? `&q=${encodeURIComponent(name)}` : '';
  return `maps://maps.apple.com/?ll=${lat},${lng}${q}`;
}

/**
 * Open a location in the user's preferred maps app.
 * iOS: shows action sheet to choose between Google Maps and Apple Maps.
 * Android: opens Google Maps directly.
 */
export function openInMaps(
  lat: number,
  lng: number,
  name?: string,
  googlePlaceId?: string,
): void {
  const googleUrl = getGoogleMapsUrl(lat, lng, name, googlePlaceId);
  const appleUrl = getAppleMapsUrl(lat, lng, name);

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Open in Apple Maps', 'Open in Google Maps'],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) Linking.openURL(appleUrl);
        if (buttonIndex === 2) Linking.openURL(googleUrl);
      },
    );
  } else {
    Linking.openURL(googleUrl);
  }
}

/**
 * Build a Google Maps directions URL for a day's stops.
 * Opens with origin, destination, and waypoints pre-filled.
 */
export function getDayRouteUrl(
  stops: { lat: number; lng: number }[],
  travelMode: 'walking' | 'driving' | 'transit' = 'walking',
): string | null {
  if (stops.length < 2) return null;

  const origin = `${stops[0].lat},${stops[0].lng}`;
  const dest = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
  const waypoints = stops
    .slice(1, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${travelMode}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

/**
 * Build a Google Maps route URL for an entire trip using city names.
 */
export function getTripRouteUrl(cityNames: string[]): string | null {
  if (cityNames.length < 2) return null;
  const destinations = cityNames.map((c) => encodeURIComponent(c));
  return `https://www.google.com/maps/dir/${destinations.join('/')}`;
}

/** Open a day route in maps. Returns false if not enough stops with coordinates. */
export function openDayRoute(
  stops: { lat: number; lng: number }[],
  travelMode: 'walking' | 'driving' | 'transit' = 'walking',
): boolean {
  const url = getDayRouteUrl(stops, travelMode);
  if (!url) return false;
  Linking.openURL(url);
  return true;
}

/** Open a trip route in maps using city names. */
export function openTripRoute(cityNames: string[]): boolean {
  const url = getTripRouteUrl(cityNames);
  if (!url) return false;
  Linking.openURL(url);
  return true;
}
