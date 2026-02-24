import { useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface Tab {
  label: string;
}

interface CountryTabBarProps {
  tabs: Tab[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export function CountryTabBar({ tabs, activeIndex, onTabPress }: CountryTabBarProps) {
  const scrollRef = useRef<ScrollView>(null);
  const tabXRef = useRef<number[]>([]);

  useEffect(() => {
    const x = tabXRef.current[activeIndex];
    if (x != null && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, x - spacing.screenX), animated: true });
    }
  }, [activeIndex]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.label}
              style={styles.tab}
              onPress={() => onTabPress(index)}
              onLayout={(e) => {
                tabXRef.current[index] = e.nativeEvent.layout.x;
              }}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.indicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.screenX,
    gap: 20,
  },
  tab: {
    paddingVertical: 14,
    position: 'relative',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 18,
  },
  labelActive: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  border: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
});
