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
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="discussions" options={{ title: 'Discussions' }} />
      <Tabs.Screen name="travelers" options={{ title: 'Travelers' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', href: null }} />
    </Tabs>
  );
}
