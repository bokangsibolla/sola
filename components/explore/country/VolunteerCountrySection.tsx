import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getVolunteersByCountry } from '@/data/api';
import { PlaceHorizontalCard } from './PlaceHorizontalCard';

interface Props {
  countryId: string;
  countryName: string;
}

export function VolunteerCountrySection({ countryId, countryName }: Props) {
  const router = useRouter();
  const { data: volunteers } = useData(
    () => getVolunteersByCountry(countryId, 10),
    ['volunteersByCountry', countryId],
  );

  if (!volunteers || volunteers.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Volunteer in {countryName}</Text>
        {volunteers.length > 3 && (
          <Pressable hitSlop={8} onPress={() => router.push('/discover/volunteer' as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {volunteers.map((v) => (
          <PlaceHorizontalCard key={v.id} place={v} compact />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  scrollContent: {
    paddingRight: spacing.screenX,
  },
});
