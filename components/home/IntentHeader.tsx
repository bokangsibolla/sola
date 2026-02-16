import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

export function IntentHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Where are you planning next?</Text>
      <Pressable
        style={({ pressed }) => [
          styles.searchBar,
          pressed && { opacity: pressedState.opacity },
        ]}
        onPress={() => router.push('/discover/search')}
      >
        <Text style={styles.searchText}>Search destinations</Text>
        <Feather name="search" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  searchText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
