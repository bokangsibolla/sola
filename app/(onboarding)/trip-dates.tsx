import PolarstepsCard from '@/components/onboarding/PolarstepsCard';
import PolarstepsShell from '@/components/onboarding/PolarstepsShell';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Body, Label } from '@/components/ui/SolaText';
import { theme } from '@/constants/theme';
import { onboardingStore } from '@/state/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

const MAP_PLACEHOLDER = require('@/assets/images/orange-gradient.png');

export default function TripDatesScreen() {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>(() => {
    const stored = onboardingStore.getTripStartDate();
    return stored ? new Date(stored) : new Date();
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const stored = onboardingStore.getTripEndDate();
    return stored ? new Date(stored) : null;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
    }
  };

  const handleEndDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleContinue = () => {
    onboardingStore.setTripStartDate(startDate.toISOString());
    if (endDate) {
      onboardingStore.setTripEndDate(endDate.toISOString());
    }
    const intent = onboardingStore.getIntent();
    if (intent === 'traveling-now' || intent === 'traveling-soon') {
      router.push('/(onboarding)/privacy');
    } else {
      onboardingStore.setOnboardingCompleted(true);
      router.replace('/(tabs)/explore');
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <PolarstepsShell backgroundImage={MAP_PLACEHOLDER}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <ProgressIndicator currentStep={3} totalSteps={5} />
      </View>

      <PolarstepsCard scrollable>
        <Body style={styles.title}>When will your trip start?</Body>

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Label style={styles.dateLabel}>Start date</Label>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Body style={styles.dateText}>{formatDate(startDate)}</Body>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <Ionicons name="arrow-forward" size={20} color={theme.colors.muted} style={styles.arrow} />

          <View style={styles.dateField}>
            <Label style={styles.dateLabel}>End date</Label>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Body style={styles.dateText}>
                {endDate ? formatDate(endDate) : 'Optional'}
              </Body>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
                minimumDate={startDate}
              />
            )}
          </View>
        </View>
      </PolarstepsCard>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
        />
      </View>
    </PolarstepsShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: theme.colors.muted,
  },
  dateButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: theme.colors.text,
  },
  arrow: {
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});
