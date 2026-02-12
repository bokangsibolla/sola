import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country } from '@/data/types';
import type { EmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface Props {
  country: Country;
  emergency: EmergencyNumbers;
}

interface RefCell {
  key: string;
  label: string;
  kind: 'value' | 'link' | 'providers';
  value?: string;
  linkLabel?: string;
  url?: string;
  providers?: Array<{ name: string; url: string; note?: string }>;
}

function openUrl(url: string) {
  Linking.openURL(url);
}

function callNumber(number: string) {
  Linking.openURL(`tel:${number}`);
}

function buildCells(country: Country): RefCell[] {
  const cells: RefCell[] = [];

  if (country.currency) {
    cells.push({ key: 'currency', label: 'Currency', kind: 'value', value: country.currency });
  }
  if (country.language) {
    cells.push({ key: 'language', label: 'Language', kind: 'value', value: country.language });
  }
  if (country.immigrationUrl) {
    cells.push({
      key: 'visa',
      label: 'Visa',
      kind: 'link',
      linkLabel: 'Official site',
      url: country.immigrationUrl,
    });
  }
  if (country.arrivalCardUrl) {
    cells.push({
      key: 'arrival',
      label: 'Arrival card',
      kind: 'link',
      linkLabel: 'Fill online',
      url: country.arrivalCardUrl,
    });
  }
  if (country.simProviders && country.simProviders.length > 0) {
    cells.push({
      key: 'sim',
      label: 'SIM / eSIM',
      kind: 'providers',
      providers: country.simProviders,
    });
  }

  return cells;
}

function buildEmergencyNumbers(emergency: EmergencyNumbers) {
  const nums: Array<{ label: string; number: string }> = [
    { label: 'Police', number: emergency.police },
    { label: 'Ambulance', number: emergency.ambulance },
    { label: 'Fire', number: emergency.fire },
  ];
  if (emergency.general && emergency.general !== emergency.police) {
    nums.push({ label: 'General', number: emergency.general });
  }
  return nums;
}

function GridCell({
  cell,
  isRight,
  isBottom,
}: {
  cell: RefCell;
  isRight: boolean;
  isBottom: boolean;
}) {
  return (
    <View
      style={[
        styles.cell,
        !isRight && styles.cellBorderRight,
        !isBottom && styles.cellBorderBottom,
      ]}
    >
      <Text style={styles.cellLabel}>{cell.label}</Text>

      {cell.kind === 'value' && (
        <Text style={styles.cellValue} numberOfLines={2}>
          {cell.value}
        </Text>
      )}

      {cell.kind === 'link' && cell.url && (
        <Pressable onPress={() => openUrl(cell.url!)} hitSlop={8}>
          <View style={styles.cellLinkRow}>
            <Text style={styles.cellLink}>{cell.linkLabel}</Text>
            <Ionicons
              name="open-outline"
              size={11}
              color={colors.orange}
              style={styles.cellLinkIcon}
            />
          </View>
        </Pressable>
      )}

      {cell.kind === 'providers' && cell.providers && (
        <View style={styles.providerList}>
          {cell.providers.map((p, i) => (
            <Pressable key={i} onPress={() => openUrl(p.url)} hitSlop={4}>
              <Text style={styles.cellLink}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function QuickReference({ country, emergency }: Props) {
  const cells = buildCells(country);
  const emergencyNums = buildEmergencyNumbers(emergency);

  if (cells.length === 0 && emergencyNums.length === 0) return null;

  // Build grid rows of 2
  const gridRows: Array<[RefCell, RefCell | null]> = [];
  for (let i = 0; i < cells.length; i += 2) {
    gridRows.push([cells[i], cells[i + 1] ?? null]);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Quick reference</Text>

      {/* Reference grid */}
      {gridRows.length > 0 && (
        <View style={styles.grid}>
          {gridRows.map(([left, right], rowIdx) => {
            const isBottom = rowIdx === gridRows.length - 1;
            return (
              <View key={left.key} style={styles.gridRow}>
                <GridCell cell={left} isRight={!right} isBottom={isBottom} />
                {right ? (
                  <GridCell cell={right} isRight={true} isBottom={isBottom} />
                ) : (
                  <View style={[styles.cell, styles.cellBorderBottom_none]} />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Emergency numbers */}
      {emergencyNums.length > 0 && (
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyLabel}>Emergency</Text>
          <View style={styles.emergencyRow}>
            {emergencyNums.map((num, i) => (
              <Pressable
                key={i}
                onPress={() => callNumber(num.number)}
                hitSlop={6}
                style={styles.emergencyItem}
              >
                <Text style={styles.emergencyType}>{num.label}</Text>
                <Text style={styles.emergencyNumber}>{num.number}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // --- Reference grid ---
  grid: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  cellBorderBottom_none: {},
  cellLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cellValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  cellLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellLink: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.orange,
    lineHeight: 22,
  },
  cellLinkIcon: {
    marginLeft: spacing.xs,
  },
  providerList: {
    gap: spacing.xs,
  },

  // --- Emergency ---
  emergencyCard: {
    backgroundColor: colors.emergencyFill,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emergencyLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.emergency,
    marginBottom: spacing.sm,
  },
  emergencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  emergencyItem: {
    minWidth: 64,
  },
  emergencyType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  emergencyNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.emergency,
  },
});
