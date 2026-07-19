import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../auth/authStore';
import { configureGoogle } from '../auth/googleAuth';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import AboutScreen from '../screens/AboutScreen';
import SecurityScreen from '../screens/SecurityScreen';
import HelpScreen from '../screens/HelpScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    configureGoogle();
    bootstrap();
  }, [bootstrap]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}>
        {status === 'idle' || status === 'checking' ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : status === 'authenticated' ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Security"
              component={SecurityScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
