import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/design';

interface ProgressBarProps {
  /** Current stage 1-5 */
  stage: number;
}

export default function ProgressBar({ stage }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          style={[styles.segment, s <= stage && styles.segmentFilled]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 16,
  },
  segment: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
  },
  segmentFilled: {
    backgroundColor: colors.orange,
  },
});
