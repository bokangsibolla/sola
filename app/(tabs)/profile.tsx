import { StyleSheet, View, Pressable, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { Title, Body, Label } from '@/components/ui/SolaText';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, spacing, radius, typography } from '@/constants/design';

export default function ProfileScreen() {
  const router = useRouter();
  const data = onboardingStore.getData();

  const formatValue = (value: string | string[] | null): string => {
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Not set';
    return value || 'Not set';
  };

  return (
    <AppScreen>
      <AppHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Your setup</Title>

          <View style={styles.item}>
            <Label>Name</Label>
            <Body>{formatValue(data.firstName || null)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Home country</Label>
            <Body>{formatValue(data.countryName || null)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Travel intent</Label>
            <Body>{formatValue(data.tripIntent || null)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Day style</Label>
            <Body>{formatValue(data.dayStyle)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Priorities</Label>
            <Body>{formatValue(data.priorities)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Stay preference</Label>
            <Body>{formatValue(data.stayPreference || null)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Spending style</Label>
            <Body>{formatValue(data.spendingStyle || null)}</Body>
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/(onboarding)/profile')}>
          <Text style={styles.buttonText}>Edit preferences</Text>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  item: {
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  buttonText: {
    color: colors.background,
    ...typography.body,
    fontWeight: '600',
  },
});
