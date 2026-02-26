import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import NavigationHeader from '@/components/NavigationHeader';
import { HamburgerButton } from '@/components/home/HamburgerButton';
import { colors, fonts, spacing } from '@/constants/design';

export default function TripsScreen() {
  return (
    <AppScreen>
      <NavigationHeader
        title="Trips"
        rightActions={<HamburgerButton />}
      />
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="airplane-outline" size={32} color={colors.orange} />
        </View>
        <Text style={styles.title}>Trip planning is coming soon</Text>
        <Text style={styles.subtitle}>
          We're building something thoughtful for how you plan and organise your travels. Stay tuned.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX * 2,
    paddingBottom: 80,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
