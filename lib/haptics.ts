import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Semantic haptic feedback for Sola.
 *
 * Philosophy: haptics as punctuation — only on moments that mean something.
 * If the user changed state or completed an action, they feel it.
 * If they're browsing or navigating, silence.
 *
 * iOS-only for now — Android haptics are inconsistent across devices.
 */

const isIOS = Platform.OS === 'ios';

/** Light tap — navigation, toggles, pull-to-refresh complete */
function tap() {
  if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium impact — actions that change state: send, save, connect, publish */
function action() {
  if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Heavy impact — safety-critical: SOS activation */
function critical() {
  if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/** Success feedback — confirmation of completed action */
function confirm() {
  if (isIOS) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export const haptics = { tap, action, critical, confirm };
