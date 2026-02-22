import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing } from '@/constants/design';

interface SegmentedControlProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export default function SegmentedControl({ tabs, activeIndex, onTabPress }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => onTabPress(index)}
          >
            <SolaText style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </SolaText>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.xl,
    right: spacing.xl,
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
});
