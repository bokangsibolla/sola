import { theme } from '@/constants/theme';
import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

interface PolarstepsCardProps {
  children: React.ReactNode;
  scrollable?: boolean;
  semiTransparent?: boolean; // New prop for semi-transparent card
  compact?: boolean; // New prop for smaller, more compact card
}

export default function PolarstepsCard({ 
  children, 
  scrollable = false,
  semiTransparent = false,
  compact = false
}: PolarstepsCardProps) {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: [styles.cardContent, compact && styles.cardContentCompact],
  } : { style: [styles.cardContent, compact && styles.cardContentCompact] };

  return (
    <View style={[
      styles.card,
      semiTransparent && styles.cardSemiTransparent,
      compact && styles.cardCompact
    ]}>
      <ContentWrapper {...contentProps}>
        {children}
      </ContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '55%',
    minHeight: 180,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  cardCompact: {
    maxHeight: '38%', // Compact but enough for content
    minHeight: 200,
    marginBottom: 0, // Ensure no extra margin
  },
  cardSemiTransparent: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Transparent but readable
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  cardContentCompact: {
    paddingTop: 16,
    paddingBottom: 4,
  },
});
