import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface TripPrivacyCardProps {
  variant: 'privacy' | 'matching';
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function TripPrivacyCard({ variant, value, onValueChange }: TripPrivacyCardProps) {
  const isPrivacy = variant === 'privacy';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isPrivacy ? 'lock-closed-outline' : 'people-outline'}
            size={20}
            color={colors.textPrimary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isPrivacy ? 'Keep trip private' : 'Traveler matching'}
          </Text>
          <Text style={styles.description}>
            {isPrivacy
              ? 'Your trip is only visible to you'
              : 'Allow Sola to recommend travelers on your route'}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.borderDefault, true: colors.orangeFill }}
          thumbColor={value ? colors.orange : '#FFFFFF'}
        />
      </View>
      {!isPrivacy && value && (
        <Text style={styles.consent}>
          When enabled, travelers with overlapping dates and cities can see your name and travel style — never your exact location or journal entries.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  consent: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
});
