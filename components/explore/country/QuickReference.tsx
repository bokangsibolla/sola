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
  | { kind: 'link'; key: string; icon: keyof typeof Ionicons.glyphMap; label: string; linkLabel: string; url: string }
  | { kind: 'value'; key: string; icon: keyof typeof Ionicons.glyphMap; label: string; value: string }
  | { kind: 'sim'; key: string; icon: keyof typeof Ionicons.glyphMap; label: string; providers: Array<{ name: string; url: string; note?: string }> };

function openUrl(url: string) {
  Linking.openURL(url);
}

function buildRows(country: Country, emergency: EmergencyNumbers): RowData[] {
  const rows: RowData[] = [];

  if (country.immigrationUrl) {
    rows.push({
      kind: 'link',
      key: 'visa',
      icon: 'document-text-outline',
      label: 'Visa info',
      linkLabel: 'Official site',
      url: country.immigrationUrl,
    });
  }

  if (country.arrivalCardUrl) {
    rows.push({
      kind: 'link',
      key: 'arrival',
      icon: 'airplane-outline',
      label: 'Arrival card',
      linkLabel: 'Fill online',
      url: country.arrivalCardUrl,
    });
  }

  if (country.simProviders && country.simProviders.length > 0) {
    rows.push({
      kind: 'sim',
      key: 'sim',
      icon: 'phone-portrait-outline',
      label: 'SIM cards',
      providers: country.simProviders,
    });
  }

  if (country.currency) {
    rows.push({
      kind: 'value',
      key: 'currency',
      icon: 'cash-outline',
      label: 'Currency',
      value: country.currency,
    });
  }

  rows.push({
    kind: 'value',
    key: 'emergency',
    icon: 'call-outline',
    label: 'Emergency',
    value: `Police: ${emergency.police} \u00B7 Ambulance: ${emergency.ambulance}`,
  });

  if (country.bestMonths) {
    rows.push({
      kind: 'value',
      key: 'besttime',
      icon: 'calendar-outline',
      label: 'Best time',
      value: country.bestMonths,
    });
  }

  return rows;
}

export function QuickReference({ country, emergency }: Props) {
  const rows = buildRows(country, emergency);

  if (rows.length <= 1) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick Reference</Text>
      <View style={styles.card}>
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;

          return (
            <View key={row.key} style={[styles.row, !isLast && styles.rowBorder]}>
              <View style={styles.rowHeader}>
                <Ionicons name={row.icon} size={18} color={colors.textMuted} style={styles.rowIcon} />
                <Text style={styles.rowLabel}>{row.label}</Text>
                {row.kind === 'value' && (
                  <Text style={styles.rowValue}>{row.value}</Text>
                )}
                {row.kind === 'link' && (
                  <Pressable onPress={() => openUrl(row.url)}>
                    <Text style={styles.linkText}>{row.linkLabel}</Text>
                  </Pressable>
                )}
              </View>
              {row.kind === 'sim' && (
                <View style={styles.simList}>
                  {row.providers.map((provider, i) => (
                    <Pressable key={i} onPress={() => openUrl(provider.url)} style={styles.simRow}>
                      <Text style={styles.linkText}>{provider.name}</Text>
                      {provider.note && <Text style={styles.simNote}> - {provider.note}</Text>}
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
  container: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: spacing.sm,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    width: 80,
  },
  rowValue: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.orange,
  },
  simList: {
    paddingLeft: 26,
    paddingTop: spacing.sm,
  },
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  simNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
