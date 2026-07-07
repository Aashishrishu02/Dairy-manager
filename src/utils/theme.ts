export const colors = {
  primary: '#1A6B3C',       // deep dairy green
  primaryLight: '#E8F5EE',
  primaryMid: '#2E8B57',
  accent: '#F5A623',        // warm amber / milk gold
  accentLight: '#FFF8EC',
  danger: '#D94040',
  dangerLight: '#FDEAEA',
  success: '#2E8B57',
  bg: '#F7F6F2',            // warm off-white
  surface: '#FFFFFF',
  surfaceAlt: '#F0EEE9',
  border: '#E2DED7',
  textPrimary: '#1A1A16',
  textSecondary: '#6B6860',
  textTertiary: '#9E9B94',
  textOnPrimary: '#FFFFFF',
  amBadge: '#FFF3CD',
  amText: '#7D5A00',
  pmBadge: '#E8F5EE',
  pmText: '#1A6B3C',
};

export const typography = {
  // Use system fonts available on Android/iOS
  fontDisplay: 'serif',     // fallback serif for headings
  fontBody: 'System',
  fontMono: 'monospace',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
};
