import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/design';

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    zIndex: 1000,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
