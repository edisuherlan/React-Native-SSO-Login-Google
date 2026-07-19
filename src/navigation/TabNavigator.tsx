import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/theme';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: string; inactive: string }> = {
  Beranda: { active: 'home', inactive: 'home-outline' },
  Aktivitas: { active: 'pulse', inactive: 'pulse-outline' },
  Profil: { active: 'person', inactive: 'person-outline' },
};

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ],
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, focused, size }) => {
          const set = ICONS[route.name];
          const name = focused ? set.active : set.inactive;
          return <Icon name={name} size={size ?? 24} color={color} />;
        },
      })}>
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Aktivitas" component={ActivityScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
