import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function registerForPushNotifications(): Promise<string | null> {
  if (isExpoGo || !Device.isDevice) {
    return null;
  }

  const Notifications = require('expo-notifications');

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/**
 * Registers for push notifications and saves the token to Supabase.
 * Call this once the user is authenticated.
 */
export function usePushNotifications(userId: string | null) {
  const registered = useRef(false);

  useEffect(() => {
    if (!userId || registered.current) return;

    registerForPushNotifications()
      .then(async (token) => {
        if (!token) return;

        const { error } = await supabase
          .from('push_tokens')
          .upsert({ user_id: userId, token }, { onConflict: 'user_id,token' });

        if (error) {
          Sentry.captureMessage(`Failed to save push token: ${error.message}`);
          return;
        }

        registered.current = true;
      })
      .catch((error) => {
        Sentry.captureException(error);
      });
  }, [userId]);

  useEffect(() => {
    if (!isExpoGo && Platform.OS === 'android') {
      const Notifications = require('expo-notifications');
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);
}
