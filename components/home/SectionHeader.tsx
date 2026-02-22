import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <SolaText variant="sectionTitle">{title}</SolaText>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <SolaText style={styles.seeAll}>See all</SolaText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.lg,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.orange,
  },
});
