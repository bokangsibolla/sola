import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { searchDestinations } from '@/data/api';
import { useData } from '@/hooks/useData';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const DAY_MS = 86_400_000;

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function nightsBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY_MS));
}

export default function NewTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [destination, setDestination] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [flexible, setFlexible] = useState(false);

  const tomorrow = new Date(Date.now() + DAY_MS);
  const [arriving, setArriving] = useState<Date | null>(null);
  const [leaving, setLeaving] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'arriving' | 'leaving' | null>(null);

  const nights = arriving && leaving ? nightsBetween(arriving, leaving) : 0;

  const { data: results } = useData(
    () => search.length < 2 ? Promise.resolve([]) : searchDestinations(search).then((r) => r.slice(0, 6)),
    [search],
  );

  const handleSelect = (name: string, id: string) => {
    setDestination(name);
    setSelectedCityId(id);
    setSearch('');
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (event.type === 'dismissed') {
      setShowPicker(null);
      return;
    }
    if (!date) return;

    if (showPicker === 'arriving') {
      setArriving(date);
      if (leaving && date >= leaving) setLeaving(null);
      if (Platform.OS === 'ios') return;
      setTimeout(() => setShowPicker('leaving'), 300);
    } else {
      setLeaving(date);
      if (Platform.OS === 'android') setShowPicker(null);
    }
  };

  const canSave = destination.length > 0 || search.trim().length > 0;

  const handleSave = () => {
    // In a real app, persist to store/DB
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>New trip</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Destination search */}
        <Text style={styles.label}>Where are you going?</Text>
        <View style={styles.inputRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="City or country..."
            placeholderTextColor={colors.textMuted}
            value={destination || search}
            onChangeText={(t) => {
              setDestination('');
              setSelectedCityId(null);
              setSearch(t);
            }}
          />
          {(destination || search).length > 0 && (
            <Pressable
              onPress={() => { setDestination(''); setSelectedCityId(null); setSearch(''); }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {(results ?? []).length > 0 && !destination && (
          <View style={styles.results}>
            {(results ?? []).map((r, i) => (
              <Pressable
                key={`${r.id}-${i}`}
                style={styles.resultRow}
                onPress={() => handleSelect(r.name, r.id)}
              >
                <Text style={styles.resultName}>{r.name}</Text>
                <Text style={styles.resultDetail}>
                  {r.type === 'city' && r.parentName ? r.parentName : r.type === 'country' ? 'Country' : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Date pickers */}
        {(destination || search.trim()) ? (
          <View style={styles.dateSection}>
            <Text style={styles.label}>When are you going?</Text>
            <View style={styles.dateRow}>
              <Pressable
                style={[styles.dateCard, arriving && styles.dateCardFilled]}
                onPress={() => setShowPicker('arriving')}
              >
                <Text style={styles.dateCardLabel}>Arriving</Text>
                <Text style={[styles.dateCardValue, arriving && styles.dateCardValueFilled]}>
                  {arriving ? formatDate(arriving) : 'Pick a date'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.dateCard, leaving && styles.dateCardFilled]}
                onPress={() => {
                  if (!arriving) { setShowPicker('arriving'); return; }
                  setShowPicker('leaving');
                }}
              >
                <Text style={styles.dateCardLabel}>Leaving</Text>
                <Text style={[styles.dateCardValue, leaving && styles.dateCardValueFilled]}>
                  {leaving ? formatDate(leaving) : 'Pick a date'}
                </Text>
              </Pressable>
            </View>

            {nights > 0 && (
              <View style={styles.nightsGroup}>
                <View style={styles.nightsBadge}>
                  <Text style={styles.nightsText}>
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </Text>
                </View>
              </View>
            )}

            {/* Flexible dates toggle */}
            <View style={styles.flexibleRow}>
              <Text style={styles.flexibleText}>Flexible dates</Text>
              <Switch
                value={flexible}
                onValueChange={setFlexible}
                trackColor={{ false: colors.borderDefault, true: colors.orangeFill }}
                thumbColor={flexible ? colors.orange : '#FFFFFF'}
              />
            </View>

            {/* iOS inline picker */}
            {Platform.OS === 'ios' && showPicker && (
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    {showPicker === 'arriving' ? 'Arriving' : 'Leaving'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      if (showPicker === 'arriving' && arriving && !leaving) {
                        setShowPicker('leaving');
                      } else {
                        setShowPicker(null);
                      }
                    }}
                  >
                    <Text style={styles.pickerDone}>
                      {showPicker === 'arriving' && arriving && !leaving ? 'Next' : 'Done'}
                    </Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={
                    showPicker === 'arriving'
                      ? arriving || tomorrow
                      : leaving || new Date((arriving?.getTime() || Date.now()) + DAY_MS)
                  }
                  mode="date"
                  display="inline"
                  minimumDate={
                    showPicker === 'arriving'
                      ? tomorrow
                      : new Date((arriving?.getTime() || Date.now()) + DAY_MS)
                  }
                  onChange={handleDateChange}
                  accentColor={colors.orange}
                />
              </View>
            )}
          </View>
        ) : null}

        {/* Notes */}
        <Text style={[styles.label, { marginTop: spacing.xl }]}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Things to remember, places to visit..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={300}
        />
        <Text style={styles.charCount}>{notes.length}/300</Text>

        {/* Save button */}
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>Save trip</Text>
        </Pressable>
      </ScrollView>

      {/* Android picker modal */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={
            showPicker === 'arriving'
              ? arriving || tomorrow
              : leaving || new Date((arriving?.getTime() || Date.now()) + DAY_MS)
          }
          mode="date"
          display="default"
          minimumDate={
            showPicker === 'arriving'
              ? tomorrow
              : new Date((arriving?.getTime() || Date.now()) + DAY_MS)
          }
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  navTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  results: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultDetail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  dateSection: {
    marginTop: spacing.xl,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCard: {
    flex: 1,
    height: 64,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  dateCardFilled: {
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: colors.orangeFill,
  },
  dateCardLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dateCardValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  dateCardValueFilled: {
    color: colors.textPrimary,
  },
  nightsGroup: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  nightsBadge: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nightsText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.orange,
  },
  flexibleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  flexibleText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pickerContainer: {
    marginTop: spacing.lg,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerDone: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
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
  },
  charCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
