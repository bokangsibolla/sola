import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { PlaceRowCard } from './PlaceRowCard';
import { colors, fonts, spacing } from '@/constants/design';
import type { PlaceWithCity } from '@/data/types';

interface PlaceRowProps {
  title: string;
  places: PlaceWithCity[];
}

export function PlaceRow({ title, places }: PlaceRowProps) {
  if (places.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceRowCard place={item} />}
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
