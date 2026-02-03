import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/design';
import { onboardingStore } from '@/state/onboardingStore';

interface ProgressBarProps {
  /** Current stage (1-based index) */
  stage: number;
  /** Total number of stages (defaults to dynamic from A/B config, or 5 if not set) */
  totalStages?: number;
}

export default function ProgressBar({ stage, totalStages }: ProgressBarProps) {
  // Use provided totalStages, or get from A/B config, or fallback to 5
  const total = totalStages ?? (onboardingStore.get('screensToShow').length || 5);
  const percent = (stage / total) * 100;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: colors.borderDefault,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: 2,
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
});
