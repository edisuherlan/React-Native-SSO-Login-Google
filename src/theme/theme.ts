import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryContrast: string;
  danger: string;
  text: string;
  textMuted: string;
  textOnGradientMuted: string;
  success: string;
  gradientStart: string;
  gradientEnd: string;
  overlay: string;
}

const light: ThemeColors = {
  background: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF2F5',
  border: '#E1E6EB',
  primary: '#D81BC5',
  primaryContrast: '#FFFFFF',
  danger: '#E02459',
  text: '#171A21',
  textMuted: '#6B7280',
  textOnGradientMuted: 'rgba(255,255,255,0.85)',
  success: '#1E8E3E',
  gradientStart: '#15C4D9',
  gradientEnd: '#D81BC5',
  overlay: 'rgba(255,255,255,0.15)',
};

const dark: ThemeColors = {
  background: '#0D0F14',
  surface: '#161922',
  surfaceAlt: '#1E222D',
  border: '#2A2F3A',
  primary: '#EA4FD6',
  primaryContrast: '#FFFFFF',
  danger: '#FF5C86',
  text: '#F3F5F9',
  textMuted: '#9AA3B2',
  textOnGradientMuted: 'rgba(255,255,255,0.85)',
  success: '#4ADE80',
  gradientStart: '#12A9BC',
  gradientEnd: '#C21FB0',
  overlay: 'rgba(255,255,255,0.14)',
};

/** Warna aksen (triadic: cyan, magenta, lime, purple) untuk ikon/kartu. */
export const accents = {
  cyan: '#12C2D6',
  magenta: '#DE1BC7',
  lime: '#8FB70B',
  purple: '#8B3FE8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  button: { fontSize: 16, fontWeight: '700' as const },
};

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  isDark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? dark : light,
    spacing,
    radius,
    typography,
    isDark,
  };
}
