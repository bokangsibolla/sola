import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, fonts, pressedState, radius, spacing } from '@/constants/design';
import { useData } from '@/hooks/useData';
import { getVolunteersByCity } from '@/data/api';
import type { Place } from '@/data/types';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 160;

function volunteerTypeLabel(type: string | null): string {
  if (!type) return 'VOLUNTEER';
  const labels: Record<string, string> = {
    animal: 'ANIMAL RESCUE',
    teaching: 'TEACHING',
    conservation: 'CONSERVATION',
    community: 'COMMUNITY',
    healthcare: 'HEALTHCARE',
    construction: 'CONSTRUCTION',
    farming: 'FARMING',
  };
  return labels[type] ?? type.toUpperCase();
}

function VolunteerCard({ place }: { place: Place & { imageUrl?: string | null } }) {
  const router = useRouter();
  const imageUrl = (place as any).imageUrl ?? place.imageUrlCached ?? null;

  return (
    <Pressable
      onPress={() => router.push(`/discover/place-detail/${place.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        style={styles.gradient}
      />
      {/* Type pill */}
      <View style={styles.typePill}>
        <Text style={styles.typePillText}>
          {volunteerTypeLabel(place.volunteerType)}
        </Text>
      </View>
      {/* Bottom content */}
      <View style={styles.overlay}>
        <Text style={styles.orgName} numberOfLines={2}>{place.name}</Text>
        {place.minCommitment && (
          <Text style={styles.commitment}>Min. {place.minCommitment}</Text>
        )}
      </View>
    </Pressable>
  );
}

interface VolunteerSectionProps {
  cityId: string;
}

export function VolunteerSection({ cityId }: VolunteerSectionProps) {
  const { data: volunteers } = useData(
    () => getVolunteersByCity(cityId),
    ['volunteersByCity', cityId],
  );

  if (!volunteers || volunteers.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Volunteer</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {volunteers.map((v) => (
          <VolunteerCard key={v.id} place={v} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingRight: spacing.screenX,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as any,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImagePlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  typePill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typePillText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  orgName: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  commitment: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
