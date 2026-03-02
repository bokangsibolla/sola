import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CityRowCard } from './CityRowCard';
import { colors, fonts, spacing } from '@/constants/design';
import type { CityWithCountry } from '@/data/explore/types';

interface CityRowProps {
  title: string;
  cities: CityWithCountry[];
}

export function CityRow({ title, cities }: CityRowProps) {
  if (cities.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CityRowCard city={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  list: {
    paddingRight: spacing.screenX,
  },
  separator: {
    width: spacing.sm,
  },
});
