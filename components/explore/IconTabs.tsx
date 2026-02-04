// components/explore/IconTabs.tsx
import { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/constants/design';

interface IconTab {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface IconTabsProps {
  tabs: IconTab[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function IconTabs({ tabs, selectedKey, onSelect }: IconTabsProps) {
  const [scales] = useState(() => tabs.map(() => new Animated.Value(1)));

  const handlePressIn = useCallback(
    (index: number) => {
      Animated.spring(scales[index], {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
      }).start();
    },
    [scales]
  );

  const handlePressOut = useCallback(
    (index: number) => {
      Animated.spring(scales[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }).start();
    },
    [scales]
  );

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = tab.key === selectedKey;

        return (
          <Animated.View
            key={tab.key}
            style={[styles.tabWrapper, { transform: [{ scale: scales[index] }] }]}
          >
            <Pressable
              style={styles.tab}
              onPress={() => onSelect(tab.key)}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <Ionicons
                  name={tab.icon}
                  size={22}
                  color={isSelected ? colors.orange : colors.textMuted}
                />
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {tab.label}
              </Text>
              {isSelected && <View style={styles.underline} />}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerSelected: {
    backgroundColor: colors.orangeFill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  labelSelected: {
    color: colors.orange,
    fontFamily: fonts.semiBold,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
});
