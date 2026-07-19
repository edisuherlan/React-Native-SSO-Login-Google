import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  About: undefined;
  Security: undefined;
  Help: undefined;
};

export type TabParamList = {
  Beranda: undefined;
  Aktivitas: undefined;
  Profil: undefined;
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

/** Navigasi dari layar di dalam tab: bisa pindah tab & push rute root. */
export type TabScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
