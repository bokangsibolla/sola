import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, typography } from '@/constants/design';
import { updateTrip } from '@/data/trips/tripApi';
import { getEmergencyNumbers } from '@/data/safety';
import type { TripWithStops, TripSavedItem } from '@/data/trips/types';

interface PlanTabProps {
  trip: TripWithStops;
  savedItems: TripSavedItem[];
  onRefresh: () => void;
}

function EmergencyRow({ label, number, last }: { label: string; number: string; last?: boolean }) {
  return (
    <View style={[styles.emergencyRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.emergencyLabel}>{label}</Text>
      <Text style={styles.emergencyNumber}>{number}</Text>
    </View>
  );
}

export default function PlanTab({ trip, savedItems, onRefresh }: PlanTabProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(trip.notes || '');
  const [notesChanged, setNotesChanged] = useState(false);

  const emergency = getEmergencyNumbers(trip.countryIso2);

  const handleNotesBlur = useCallback(async () => {
    if (!notesChanged) return;
    try {
      await updateTrip(trip.id, { notes: notes.trim() || null });
      setNotesChanged(false);
    } catch {
      // Silent fail for MVP
    }
  }, [trip.id, notes, notesChanged]);

  return (
    <View style={styles.container}>
      {/* Saved places section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved places</Text>
        {savedItems.length === 0 ? (
          <Text style={styles.emptyText}>
            Save places from Explore to add them to your trip
          </Text>
        ) : (
          savedItems.map((item) => (
            <View key={item.id} style={styles.savedItemCard}>
              <View style={styles.savedItemContent}>
                <Text style={styles.savedItemType}>{item.category.toUpperCase()}</Text>
                <Text style={styles.savedItemId} numberOfLines={1}>
                  {item.entityType} · {item.entityId.slice(0, 8)}
                </Text>
              </View>
            </View>
          ))
        )}
        <Pressable
          style={styles.addPlaceBtn}
          onPress={() => {
            const firstStop = (trip.stops ?? [])[0];
            if (firstStop?.cityId) {
              router.push(`/discover/city/${firstStop.cityId}`);
            }
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.orange} />
          <Text style={styles.addPlaceText}>Add a place</Text>
        </Pressable>
      </View>

      {/* Notes section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Things to remember, places to visit..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={(t) => {
            setNotes(t);
            setNotesChanged(true);
          }}
          onBlur={handleNotesBlur}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{notes.length}/500</Text>
      </View>

      {/* Emergency numbers */}
      {emergency && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency numbers</Text>
          <View style={styles.emergencyCard}>
            <EmergencyRow label="Police" number={emergency.police} />
            <EmergencyRow label="Ambulance" number={emergency.ambulance} />
            <EmergencyRow label="Fire" number={emergency.fire} />
            {emergency.general && (
              <EmergencyRow label="General" number={emergency.general} last />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  savedItemCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  savedItemContent: {
    gap: 2,
  },
  savedItemType: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  savedItemId: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addPlaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addPlaceText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  emergencyLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  emergencyNumber: {
    ...typography.label,
    color: colors.orange,
  },
});
