// app/(tabs)/explore/see-all.tsx
// Legacy see-all screen — redirects to new browse-all screens
import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SeeAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category: string; title: string }>();

  useEffect(() => {
    const category = params.category || '';

    if (category.startsWith('continent-') || category === 'all-countries') {
      router.replace('/explore/all-countries');
    } else if (category.startsWith('cities-')) {
      router.replace('/explore/all-destinations');
    } else if (category.startsWith('activities-')) {
      router.replace('/explore/all-activities');
    } else {
      router.replace('/explore/all-countries');
    }
  }, [params.category, router]);

  return null;
}
