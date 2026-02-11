import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { colors, fonts, spacing, radius } from '@/constants/design';

function InfoSection({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionIcon}>
        <Feather name={icon} size={18} color={colors.orange} />
      </View>
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function SafetyScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Safety" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.heading}>Your safety matters</Text>
        <Text style={styles.intro}>
          Quick access to emergency resources and safety guidance for solo travelers.
        </Text>

        <InfoSection
          icon="phone"
          title="Emergency contacts"
          description="Save your trusted contacts so they're always one tap away. Coming soon."
        />

        <InfoSection
          icon="globe"
          title="Local emergency numbers"
          description="Find police, ambulance, and embassy numbers for your destination. Coming soon."
        />

        <InfoSection
          icon="alert-triangle"
          title="Safety tips"
          description="Practical advice for staying safe while traveling solo, curated by experienced travelers."
        />

        <InfoSection
          icon="share-2"
          title="Share your location"
          description="Let a trusted contact know where you are in real time. Coming soon."
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxxxl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  section: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
