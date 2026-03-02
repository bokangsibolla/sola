import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface CityChangeBannerProps {
  suggestedCity: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const CityChangeBanner: React.FC<CityChangeBannerProps> = ({
  suggestedCity,
  onUpdate,
  onDismiss,
}) => (
  <View style={styles.container}>
    <View style={styles.textArea}>
      <Text style={styles.mainText}>
        Looks like you're in {suggestedCity}
      </Text>
      <Pressable onPress={onUpdate} hitSlop={8}>
        <Text style={styles.updateLink}>Update</Text>
      </Pressable>
    </View>
    <Pressable onPress={onDismiss} hitSlop={12} style={styles.closeButton}>
      <Ionicons name="close" size={16} color={colors.textMuted} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    marginHorizontal: spacing.screenX,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
  },
  mainText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  updateLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.xs,
  },
  closeButton: {
    marginLeft: spacing.sm,
  },
});
