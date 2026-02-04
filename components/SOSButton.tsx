import React, { useEffect } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getTrips, getProfileById } from '@/data/api';
import { getEmergencyNumbers } from '@/data/safety';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { usePostHog } from 'posthog-react-native';

interface SOSButtonProps {
  externalVisible: boolean;
  onClose: () => void;
}

export default function SOSButton({ externalVisible, onClose }: SOSButtonProps) {
  const { userId } = useAuth();
  const posthog = usePostHog();
  const { data: trips } = useData(
    () => userId ? getTrips(userId) : Promise.resolve([]),
    [userId],
  );
  const { data: profile } = useData(
    () => userId ? getProfileById(userId) : Promise.resolve(undefined),
    [userId],
  );
  const activeTrip = (trips ?? []).find(
    (t) => t.status === 'active' || t.status === 'planned',
  );
  const countryIso2 = activeTrip?.countryIso2 ?? profile?.homeCountryIso2 ?? 'US';
  const numbers = getEmergencyNumbers(countryIso2);

  useEffect(() => {
    if (externalVisible) {
      posthog.capture('sos_tapped', { country: countryIso2 });
    }
  }, [externalVisible]);

  const call = async (number: string) => {
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url).catch(() =>
        Alert.alert('Call failed', `Could not dial ${number}. Try manually.`),
      );
    } else {
      Alert.alert('Calling not available', `Dial ${number} manually.`);
    }
  };

  const sendEmergencySMS = async () => {
    const body = encodeURIComponent(
      'I need help. Please check on me. I am using the Sola travel app.',
    );
    const url = Platform.OS === 'ios' ? `sms:&body=${body}` : `sms:?body=${body}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url).catch(() =>
        Alert.alert('SMS failed', 'Could not open messaging app.'),
      );
    } else {
      Alert.alert('SMS not available', 'Open your messaging app manually.');
    }
  };

  return (
    <Modal
      visible={externalVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close emergency menu"
          >
            <Feather name="x" size={22} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Feather name="shield" size={24} color={colors.emergency} />
            </View>
            <Text style={styles.title}>Emergency</Text>
            <Text style={styles.subtitle}>Tap to call local emergency services</Text>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={styles.callBtn}
              onPress={() => call(numbers.police)}
              accessibilityRole="button"
              accessibilityLabel={`Call police at ${numbers.police}`}
            >
              <Feather name="phone" size={18} color={colors.background} />
              <Text style={styles.callBtnText}>
                Police — {numbers.police}
              </Text>
            </Pressable>

            <Pressable
              style={styles.callBtn}
              onPress={() => call(numbers.ambulance)}
              accessibilityRole="button"
              accessibilityLabel={`Call ambulance at ${numbers.ambulance}`}
            >
              <Feather name="phone" size={18} color={colors.background} />
              <Text style={styles.callBtnText}>
                Ambulance — {numbers.ambulance}
              </Text>
            </Pressable>

            <Pressable
              style={styles.callBtn}
              onPress={() => call(numbers.fire)}
              accessibilityRole="button"
              accessibilityLabel={`Call fire department at ${numbers.fire}`}
            >
              <Feather name="phone" size={18} color={colors.background} />
              <Text style={styles.callBtnText}>
                Fire — {numbers.fire}
              </Text>
            </Pressable>

            <Pressable
              style={styles.shareBtn}
              onPress={sendEmergencySMS}
              accessibilityRole="button"
              accessibilityLabel="Send emergency SMS to a contact"
            >
              <Feather name="send" size={18} color={colors.orange} />
              <Text style={styles.shareBtnText}>Send emergency SMS</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 340,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.emergencyFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.emergency,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  buttons: {
    gap: spacing.md,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.emergency,
    paddingVertical: 14,
    borderRadius: radius.button,
  },
  callBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.background,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orangeFill,
    paddingVertical: 14,
    borderRadius: radius.button,
  },
  shareBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
});
