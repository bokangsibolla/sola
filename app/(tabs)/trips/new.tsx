import { useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchDestinations } from '@/data/cities';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

export default function NewTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');

  const results = useMemo(() => {
    if (search.length < 2) return [];
    return searchDestinations(search).slice(0, 6);
  }, [search]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.navTitle}>New trip</Text>
        <Pressable
          onPress={() => {
            // In a real app, save to store/DB
            router.back();
          }}
          disabled={!destination && !search.trim()}
        >
          <Text style={[styles.saveText, (!destination && !search.trim()) && { opacity: 0.35 }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Where are you going?</Text>
        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="City or country..."
            placeholderTextColor={colors.textMuted}
            value={destination || search}
            onChangeText={(t) => { setDestination(''); setSearch(t); }}
          />
        </View>

        {results.length > 0 && !destination && (
          <View style={styles.results}>
            {results.map((r, i) => (
              <Pressable
                key={`${r.name}-${i}`}
                style={styles.resultRow}
                onPress={() => { setDestination(r.name); setSearch(''); }}
              >
                <Text style={styles.resultName}>{r.name}</Text>
                <Text style={styles.resultDetail}>{r.detail}</Text>
              </Pressable>
            ))}
          </View>
        )}

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
      </ScrollView>
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
  saveText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
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
});
