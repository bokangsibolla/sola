import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/design';

interface ProgressBarProps {
  /** Current stage 1-5 */
  stage: number;
}

export default function ProgressBar({ stage }: ProgressBarProps) {
  const percent = (stage / 5) * 100;

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
