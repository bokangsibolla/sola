import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country } from '@/data/types';
import type { EmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  country: Country;
  emergency: EmergencyNumbers;
}

type RowData =
  | { kind: 'phone'; key: string; label: string; numbers: Array<{ label: string; number: string }> }
  | { kind: 'link'; key: string; label: string; linkLabel: string; url: string }
  | { kind: 'value'; key: string; label: string; value: string }
  | { kind: 'sim'; key: string; label: string; providers: Array<{ name: string; url: string; note?: string }> };

function openUrl(url: string) {
  Linking.openURL(url);
}

function callNumber(number: string) {
  Linking.openURL(`tel:${number}`);
}

function buildRows(country: Country, emergency: EmergencyNumbers): RowData[] {
  const rows: RowData[] = [];

  // Emergency numbers with tappable tel: links
  rows.push({
    kind: 'phone',
    key: 'emergency',
    label: 'Emergency',
    numbers: [
      { label: 'Police', number: emergency.police },
      { label: 'Ambulance', number: emergency.ambulance },
      ...(emergency.general ? [{ label: 'General', number: emergency.general }] : []),
    ],
  });

  if (country.currency) {
    rows.push({
      kind: 'value',
      key: 'currency',
      label: 'Currency',
      value: country.currency,
    });
  }

  if (country.immigrationUrl) {
    rows.push({
      kind: 'link',
      key: 'visa',
      label: 'Visa info',
      linkLabel: 'Official site',
      url: country.immigrationUrl,
    });
  }

  if (country.arrivalCardUrl) {
    rows.push({
      kind: 'link',
      key: 'arrival',
      label: 'Arrival card',
      linkLabel: 'Fill online',
      url: country.arrivalCardUrl,
    });
  }

  if (country.simProviders && country.simProviders.length > 0) {
    rows.push({
      kind: 'sim',
      key: 'sim',
      label: 'SIM / eSIM',
      providers: country.simProviders,
    });
  }

  if (country.language) {
    rows.push({
      kind: 'value',
      key: 'language',
      label: 'Language',
      value: country.language,
    });
  }

  return rows;
}

export function QuickReference({ country, emergency }: Props) {
  const rows = buildRows(country, emergency);

  if (rows.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Quick reference</Text>
      <View style={styles.card}>
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;

          return (
            <View key={row.key} style={[styles.row, !isLast && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{row.label}</Text>

              {row.kind === 'value' && (
                <Text style={styles.rowValue}>{row.value}</Text>
              )}

              {row.kind === 'link' && (
                <Pressable onPress={() => openUrl(row.url)} hitSlop={8}>
                  <View style={styles.linkRow}>
                    <Text style={styles.linkText}>{row.linkLabel}</Text>
                    <Ionicons name="open-outline" size={12} color={colors.orange} style={styles.linkIcon} />
                  </View>
                </Pressable>
              )}

              {row.kind === 'phone' && (
                <View style={styles.phoneGroup}>
                  {row.numbers.map((num, i) => (
                    <Pressable key={i} onPress={() => callNumber(num.number)} hitSlop={8}>
                      <Text style={styles.phoneItem}>
                        <Text style={styles.phoneLabel}>{num.label} </Text>
                        <Text style={styles.phoneNumber}>{num.number}</Text>
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {row.kind === 'sim' && (
                <View style={styles.simGroup}>
                  {row.providers.map((provider, i) => (
                    <Pressable key={i} onPress={() => openUrl(provider.url)} hitSlop={4}>
                      <View style={styles.simRow}>
                        <Text style={styles.linkText}>{provider.name}</Text>
                        {provider.note && (
                          <Text style={styles.simNote}> {provider.note}</Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rowValue: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
  },
  linkIcon: {
    marginLeft: spacing.xs,
  },
  phoneGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  phoneItem: {
    lineHeight: 22,
  },
  phoneLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  phoneNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
  simGroup: {
    gap: spacing.xs,
  },
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
