import { Tabs } from 'expo-router';
import React from 'react';
import TabBar from '@/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="home" options={{ title: 'Travelers' }} />
      <Tabs.Screen name="sos" options={{ href: null, title: 'SOS' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
