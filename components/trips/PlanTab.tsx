import React, { useState, useCallback } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, spacing, radius, typography } from '@/constants/design';
import { updateTrip } from '@/data/trips/tripApi';
import { getEmergencyNumbers, embassyLookupUrl } from '@/data/safety';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById } from '@/data/api';
import type { TripWithStops, TripSavedItem } from '@/data/trips/types';
import type { Profile } from '@/data/types';

interface PlanTabProps {
  trip: TripWithStops;
  savedItems: TripSavedItem[];
  onRefresh: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────

function formatDateRange(arriving: string | null, leaving: string | null): string {
  if (!arriving) return '';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (leaving) return `${fmt(arriving)} \u2013 ${fmt(leaving)}`;
  return fmt(arriving);
}

function buildShareMessage(trip: TripWithStops): string {
  const lines: string[] = [];
  lines.push(`I'm traveling to ${trip.destinationName}.`);
  const dates = formatDateRange(trip.arriving, trip.leaving);
  if (dates) lines.push(`Dates: ${dates}`);
  lines.push('');
  lines.push('Shared from Sola \u2014 solo travel for women');
  return lines.join('\n');
}

// ── Sub-components ───────────────────────────────────────────────

function EmergencyNumberRow({
  label,
  number,
  last,
}: {
  label: string;
  number: string;
  last?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Pressable
      style={[styles.emergencyRow, last && { borderBottomWidth: 0 }]}
      onPress={handleCopy}
    >
      <SolaText variant="body" style={styles.emergencyLabel}>{label}</SolaText>
      <View style={styles.emergencyRight}>
        <SolaText style={styles.emergencyNumber}>{number}</SolaText>
        <SolaText style={styles.copyHint}>{copied ? 'Copied' : 'Tap to copy'}</SolaText>
      </View>
    </Pressable>
  );
}

function EmergencyContactCard({ profile }: { profile: Profile }) {
  const name = profile.emergencyContactName;
  const phone = profile.emergencyContactPhone;
  const relationship = profile.emergencyContactRelationship;

  if (!name || !phone) return null;

  const relationshipLabel: Record<string, string> = {
    parent: 'Parent',
    partner: 'Partner',
    sibling: 'Sibling',
    friend: 'Friend',
  };

  const handleWhatsApp = () => {
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    const msg = encodeURIComponent(
      `Hey, just checking in from my trip. Sending this from Sola.`,
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${msg}`).catch(() => {
      Alert.alert(
        'WhatsApp not available',
        'You can call this number directly instead.',
      );
    });
  };

  const handleCall = () => {
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  return (
    <View style={styles.ecCard}>
      <View style={styles.ecTop}>
        <View style={styles.ecInfo}>
          <SolaText style={styles.ecName}>{name}</SolaText>
          {relationship && (
            <View style={styles.ecBadge}>
              <SolaText style={styles.ecBadgeText}>
                {relationshipLabel[relationship] ?? relationship}
              </SolaText>
            </View>
          )}
        </View>
        <SolaText style={styles.ecPhone}>{phone}</SolaText>
      </View>
      <View style={styles.ecActions}>
        <Pressable style={styles.ecActionBtn} onPress={handleWhatsApp}>
          <Feather name="message-circle" size={14} color={colors.greenSoft} />
          <SolaText style={[styles.ecActionText, { color: colors.greenSoft }]}>WhatsApp</SolaText>
        </Pressable>
        <Pressable style={styles.ecActionBtn} onPress={handleCall}>
          <Feather name="phone" size={14} color={colors.orange} />
          <SolaText style={[styles.ecActionText, { color: colors.orange }]}>Call</SolaText>
        </Pressable>
      </View>
    </View>
  );
}

// ── Main component ───────────────────────────────────────────────

export default function PlanTab({ trip, savedItems, onRefresh }: PlanTabProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [notes, setNotes] = useState(trip.notes || '');
  const [notesChanged, setNotesChanged] = useState(false);

  const emergency = getEmergencyNumbers(trip.countryIso2);

  const { data: profile } = useData(
    () => (userId ? getProfileById(userId).then(p => p ?? null) : Promise.resolve(null)),
    ['profile', userId ?? ''],
  );

  const handleNotesBlur = useCallback(async () => {
    if (!notesChanged) return;
    try {
      await updateTrip(trip.id, { notes: notes.trim() || null });
      setNotesChanged(false);
    } catch {
      // Silent fail for MVP
    }
  }, [trip.id, notes, notesChanged]);

  const handleShareTrip = async () => {
    try {
      await Share.share({ message: buildShareMessage(trip) });
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <View style={styles.container}>
      {/* Safety section — emergency contact + numbers + share */}
      <View style={styles.section}>
        <SolaText variant="label" style={styles.sectionTitle}>Safety</SolaText>

        {/* Emergency contact from profile */}
        {profile?.emergencyContactName && profile?.emergencyContactPhone ? (
          <EmergencyContactCard profile={profile} />
        ) : (
          <Pressable
            style={styles.setupContactBtn}
            onPress={() => router.push('/(tabs)/home/settings' as any)}
          >
            <Feather name="user-plus" size={14} color={colors.orange} />
            <SolaText style={styles.setupContactText}>Add an emergency contact</SolaText>
          </Pressable>
        )}

        {/* Emergency numbers */}
        {emergency && (
          <View style={styles.emergencyCard}>
            <EmergencyNumberRow label="Police" number={emergency.police} />
            <EmergencyNumberRow label="Ambulance" number={emergency.ambulance} />
            <EmergencyNumberRow label="Fire" number={emergency.fire} />
            {emergency.general && (
              <EmergencyNumberRow label="General" number={emergency.general} last />
            )}
          </View>
        )}

        {/* Embassy + share row */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => Linking.openURL(embassyLookupUrl)}
          >
            <Feather name="globe" size={14} color={colors.textSecondary} />
            <SolaText style={styles.actionBtnText}>Find embassy</SolaText>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleShareTrip}>
            <Feather name="share" size={14} color={colors.textSecondary} />
            <SolaText style={styles.actionBtnText}>Share my trip</SolaText>
          </Pressable>
        </View>
      </View>

      {/* Saved places section */}
      <View style={styles.section}>
        <SolaText variant="label" style={styles.sectionTitle}>Saved places</SolaText>
        {savedItems.length === 0 ? (
          <SolaText style={styles.emptyText}>
            Save places from Explore to add them to your trip
          </SolaText>
        ) : (
          savedItems.map((item) => (
            <View key={item.id} style={styles.savedItemCard}>
              <View style={styles.savedItemContent}>
                <SolaText style={styles.savedItemType}>{item.category.toUpperCase()}</SolaText>
                <SolaText style={styles.savedItemId} numberOfLines={1}>
                  {item.entityType} · {item.entityId.slice(0, 8)}
                </SolaText>
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
          <Feather name="plus-circle" size={16} color={colors.orange} />
          <SolaText style={styles.addPlaceText}>Add a place</SolaText>
        </Pressable>
      </View>

      {/* Notes section */}
      <View style={styles.section}>
        <SolaText variant="label" style={styles.sectionTitle}>Notes</SolaText>
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
        <SolaText style={styles.charCount}>{notes.length}/500</SolaText>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
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

  // Emergency numbers card
  emergencyCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  emergencyLabel: {},
  emergencyRight: {
    alignItems: 'flex-end',
  },
  emergencyNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  copyHint: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Emergency contact card
  ecCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  ecTop: {
    gap: spacing.xs,
  },
  ecInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ecName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  ecBadge: {
    backgroundColor: colors.greenFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  ecBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.greenSoft,
  },
  ecPhone: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  ecActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  ecActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.full,
  },
  ecActionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },

  // Setup prompt
  setupContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    borderStyle: 'dashed',
  },
  setupContactText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },

  // Action row (embassy + share)
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.full,
  },
  actionBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
