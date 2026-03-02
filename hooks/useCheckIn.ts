import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '@/state/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  checkIntoCity,
  clearCheckIn,
  getProfileById,
  getCityById,
  getCountryById,
} from '@/data/api';

interface CheckInCity {
  cityId: string;
  cityName: string;
  countryName: string | null;
}

interface GpsSuggestion {
  cityName: string;
  countryName: string | null;
}

export function useCheckIn() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [gpsSuggestion, setGpsSuggestion] = useState<GpsSuggestion | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [checkedInCity, setCheckedInCity] = useState<CheckInCity | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Restore check-in from profile on mount
  useEffect(() => {
    if (!userId) {
      setRestoring(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfileById(userId);
        if (cancelled || !profile?.checkinCityId) {
          setRestoring(false);
          return;
        }

        const city = await getCityById(profile.checkinCityId);
        if (cancelled || !city) {
          setRestoring(false);
          return;
        }

        const country = await getCountryById(city.countryId);

        if (!cancelled) {
          setCheckedInCity({
            cityId: city.id,
            cityName: city.name,
            countryName: country?.name ?? null,
          });
        }
      } catch {
        // Profile or city fetch failed -- not critical
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Try GPS detection
  const detectCity = useCallback(async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // City-level
      });

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo?.city) {
        setGpsSuggestion({
          cityName: geo.city,
          countryName: geo.country ?? null,
        });
      }
    } catch {
      // GPS not available -- fine
    } finally {
      setGpsLoading(false);
    }
  }, []);

  // Check in to a city
  const checkIn = useCallback(
    async (cityId: string, cityName: string, countryName: string | null) => {
      if (!userId) return;
      await checkIntoCity(userId, cityId);
      setCheckedInCity({ cityId, cityName, countryName });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['connect-feed'] });
    },
    [userId, queryClient],
  );

  // Check out
  const checkOut = useCallback(async () => {
    if (!userId) return;
    await clearCheckIn(userId);
    setCheckedInCity(null);
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  }, [userId, queryClient]);

  return {
    currentCheckIn: checkedInCity,
    gpsSuggestion,
    gpsLoading,
    restoring,
    detectCity,
    checkIn,
    checkOut,
  };
}
