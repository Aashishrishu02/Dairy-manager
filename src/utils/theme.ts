export const colors = {
  primary: '#10B981',       // Modern emerald green
  primaryLight: '#ECFDF5',  // Emerald light tint
  primaryMid: '#059669',    // Mid emerald
  accent: '#F59E0B',        // Vibrant amber / gold
  accentLight: '#FEF3C7',
  danger: '#EF4444',        // Bright modern red
  dangerLight: '#FEE2E2',
  success: '#10B981',
  bg: '#F9FAFB',            // Sleek light gray
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',    // Modern soft gray
  border: '#E5E7EB',        // Clean modern border
  textPrimary: '#111827',   // High contrast charcoal
  textSecondary: '#4B5563', // Slate gray body text
  textTertiary: '#9CA3AF',  // Muted text
  textOnPrimary: '#FFFFFF',
  amBadge: '#FEF3C7',
  amText: '#D97706',
  pmBadge: '#ECFDF5',
  pmText: '#059669',
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
