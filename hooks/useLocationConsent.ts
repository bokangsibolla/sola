import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { updateUserLocation } from '@/data/api';

interface LocationResult {
  lat: number;
  lng: number;
  cityName: string | null;
  countryName: string | null;
}

export function useLocationConsent(userId: string | null) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(async (): Promise<LocationResult | null> => {
    if (!userId) return null;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationGranted(false);
        setLoading(false);
        return null;
      }
      setLocationGranted(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // City-level only
      });

      // Reverse geocode to get city name
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const result: LocationResult = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        cityName: geo?.city ?? geo?.subregion ?? null,
        countryName: geo?.country ?? null,
      };

      // Persist to profile
      await updateUserLocation(userId, {
        lat: result.lat,
        lng: result.lng,
        cityName: result.cityName ?? undefined,
        countryName: result.countryName ?? undefined,
        sharingEnabled: true,
      });

      return result;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const disableLocation = useCallback(async () => {
    if (!userId) return;
    await updateUserLocation(userId, { sharingEnabled: false });
    setLocationGranted(false);
  }, [userId]);

  return { locationGranted, loading, requestLocation, disableLocation };
}
