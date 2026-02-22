import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

export type CountryTab = 'overview' | 'guide' | 'budget';

interface CountryTabBarProps {
  activeTab: CountryTab;
  onTabChange: (tab: CountryTab) => void;
}

const TABS: { key: CountryTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'guide', label: 'Travel Guide' },
  { key: 'budget', label: 'Budget & Practical' },
];

export function CountryTabBar({ activeTab, onTabChange }: CountryTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.underline} />}
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
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: spacing.screenX,
    backgroundColor: colors.background,
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.xl,
    position: 'relative',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  labelActive: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.orange,
  },
});
