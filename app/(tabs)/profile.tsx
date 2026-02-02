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

  const formatValue = (value: string | null): string => {
    return value || 'Not set';
  };

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

  return (
    <AppScreen>
      <AppHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Your setup</Title>

          <View style={styles.item}>
            <Label>Name</Label>
            <Body>{formatValue(fullName || null)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Home country</Label>
            <Body>{formatValue(data.homeCountryName)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Travel intent</Label>
            <Body>{formatValue(data.intent)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Trip destination</Label>
            <Body>{formatValue(data.tripLocationName)}</Body>
          </View>

          <View style={styles.item}>
            <Label>Trip dates</Label>
            <Body>
              {data.tripStartDate
                ? `${data.tripStartDate}${data.tripEndDate ? ` — ${data.tripEndDate}` : ''}`
                : 'Not set'}
            </Body>
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
    borderRadius: radius.md,
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
