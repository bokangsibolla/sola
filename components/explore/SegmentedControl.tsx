import { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export default function SegmentedControl({
  segments,
  selectedKey,
  onSelect,
}: SegmentedControlProps) {
  const [scales] = useState(() => segments.map(() => new Animated.Value(1)));

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
      <View style={styles.inner}>
        {segments.map((segment, index) => {
          const isSelected = segment.key === selectedKey;

          return (
            <Animated.View
              key={segment.key}
              style={[styles.segmentWrapper, { transform: [{ scale: scales[index] }] }]}
            >
              <Pressable
                style={[styles.segment, isSelected && styles.segmentSelected]}
                onPress={() => onSelect(segment.key)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
              >
                <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                  {segment.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    marginBottom: spacing.xl,
  },
  inner: {
    flexDirection: 'row',
    backgroundColor: colors.neutralFill,
    borderRadius: 24,
    padding: 4,
  },
  segmentWrapper: {
    flex: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.textPrimary,
  },
});
