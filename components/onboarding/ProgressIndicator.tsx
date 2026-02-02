import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            index < currentStep && styles.segmentActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  segment: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    maxWidth: 40,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
});
