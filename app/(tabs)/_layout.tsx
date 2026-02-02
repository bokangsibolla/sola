import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { colors, fonts } from '@/constants/design';
import SOSButton from '@/components/SOSButton';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const [sosVisible, setSosVisible] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomInset,
            height: Platform.OS === 'ios' ? 88 + (bottomInset - 20) : 64 + (bottomInset - 8),
          },
        ],
        tabBarIconStyle: styles.tabBarIcon,
        tabBarLabel: ({ focused, children }) => (
          <Text style={[styles.tabBarLabel, { color: focused ? colors.orange : colors.textMuted }]}>
            {children}
          </Text>
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarButton: () => (
            <Pressable style={styles.sosTab} onPress={() => setSosVisible(true)}>
              <View style={styles.sosCircle}>
                <Feather name="shield" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.sosLabel}>SOS</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => (
            <Feather name="map" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
    <SOSButton externalVisible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
    elevation: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 0 },
    }),
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabBarIcon: {
    marginTop: 2,
  },
  sosTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  sosCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#D32F2F',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
