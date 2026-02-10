import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Country } from '@/data/types';
import type { EmergencyNumbers } from '@/data/safety';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { extractLeadSentence } from './mappings';

interface Props {
  country: Country;
  emergency: EmergencyNumbers;
}

interface GuideRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  summary: string;
  detail: string | null;
}

function parseBullets(md: string): string[] {
  return md
    .split('\n')
    .map((line) => line.replace(/^#+\s.*/, '').replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim())
    .filter((line) => line.length > 10);
}

function buildRows(country: Country, emergency: EmergencyNumbers): GuideRow[] {
  const rows: GuideRow[] = [];

  if (country.gettingThereMd) {
    rows.push({
      icon: 'airplane-outline',
      label: 'Getting there',
      summary: extractLeadSentence(country.gettingThereMd),
      detail: country.gettingThereMd,
    });
  }

  if (country.visaNote || country.visaEntryMd) {
    rows.push({
      icon: 'document-text-outline',
      label: 'Visa',
      summary: country.visaNote || extractLeadSentence(country.visaEntryMd!),
      detail: country.visaEntryMd,
    });
  }

  if (country.moneyMd) {
    rows.push({
      icon: 'card-outline',
      label: 'Money',
      summary: extractLeadSentence(country.moneyMd),
      detail: country.moneyMd,
    });
  }

  if (country.simConnectivityMd) {
    rows.push({
      icon: 'phone-portrait-outline',
      label: 'SIM & WiFi',
      summary: extractLeadSentence(country.simConnectivityMd),
      detail: country.simConnectivityMd,
    });
  }

  if (country.cultureEtiquetteMd) {
    rows.push({
      icon: 'people-outline',
      label: 'Culture',
      summary: extractLeadSentence(country.cultureEtiquetteMd),
      detail: country.cultureEtiquetteMd,
    });
  }

  // Emergency row — always present, not expandable
  rows.push({
    icon: 'call-outline',
    label: 'Emergency',
    summary: `Police: ${emergency.police} \u00B7 Ambulance: ${emergency.ambulance}`,
    detail: null,
  });

  return rows;
}

export function PracticalGuide({ country, emergency }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const rows = buildRows(country, emergency);

  if (rows.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Practical Guide</Text>
      <View style={styles.card}>
        {rows.map((row, index) => {
          const isExpanded = expandedIndex === index;
          const isExpandable = !!row.detail;
          const isLast = index === rows.length - 1;
          const bullets = isExpanded && row.detail ? parseBullets(row.detail) : [];

          return (
            <Pressable
              key={row.label}
              onPress={() => {
                if (!isExpandable) return;
                setExpandedIndex(isExpanded ? null : index);
              }}
              style={[styles.row, !isLast && styles.rowBorder]}
            >
              <View style={styles.rowHeader}>
                <Ionicons name={row.icon} size={18} color={colors.textMuted} style={styles.rowIcon} />
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowSummary} numberOfLines={isExpanded ? undefined : 1}>
                  {row.summary}
                </Text>
                {isExpandable && (
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                    style={styles.chevron}
                  />
                )}
              </View>
              {isExpanded && bullets.length > 0 && (
                <View style={styles.expandedContent}>
                  {bullets.slice(0, 6).map((bullet, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
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
  rowSummary: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  expandedContent: {
    paddingTop: spacing.md,
    paddingLeft: 26,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  bulletText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
});
