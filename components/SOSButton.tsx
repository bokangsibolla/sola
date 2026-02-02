import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getTrips } from '@/data/api';
import { getEmergencyNumbers } from '@/data/safety';
import { onboardingStore } from '@/state/onboardingStore';

function getCountryIso2(): string {
  // Check for active/planned trip first
  const trips = getTrips('me');
  const activeTrip = trips.find(
    (t) => t.status === 'active' || t.status === 'planned',
  );
  if (activeTrip) return activeTrip.countryIso2;

  // Fallback to home country
  return onboardingStore.get('countryIso2') || 'US';
}

export default function SOSButton() {
  const [visible, setVisible] = useState(false);

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  const numbers = getEmergencyNumbers(getCountryIso2());

  const call = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const shareLocation = () => {
    Linking.openURL('sms:&body=I need help. My location: ');
  };

  return (
    <>
      <Pressable style={styles.fab} onPress={handleOpen}>
        <Ionicons name="shield" size={24} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>

            <Text style={styles.title}>Emergency</Text>

            <View style={styles.buttons}>
              <Pressable
                style={styles.callBtn}
                onPress={() => call(numbers.police)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.callBtnText}>
                  Call Police ({numbers.police})
                </Text>
              </Pressable>

              <Pressable
                style={styles.callBtn}
                onPress={() => call(numbers.ambulance)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.callBtnText}>
                  Call Ambulance ({numbers.ambulance})
                </Text>
              </Pressable>

              <Pressable
                style={styles.callBtn}
                onPress={() => call(numbers.fire)}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.callBtnText}>
                  Call Fire ({numbers.fire})
                </Text>
              </Pressable>

              <Pressable style={styles.shareBtn} onPress={shareLocation}>
                <Ionicons
                  name="location"
                  size={20}
                  color={colors.orange}
                />
                <Text style={styles.shareBtnText}>Share my location</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 100,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttons: {
    gap: spacing.md,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: radius.button,
  },
  callBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
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
    fontSize: 16,
    color: colors.orange,
  },
});
