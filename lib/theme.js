// Design tokens for ZERO. Use these instead of hard-coded values.

export const colors = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceHigh: '#1c1c1c',
  border: '#232323',
  text: '#f5f5f5',
  textMuted: '#9a9a9a',
  textFaint: '#5e5e5e',
  accent: '#4cc764',
  accentSoft: 'rgba(76, 199, 100, 0.14)',
  accentDark: '#2e9e3a',
  warn: '#e8a33d',
  warnSoft: 'rgba(232, 163, 61, 0.14)',
  danger: '#ef6461',
  dangerSoft: 'rgba(239, 100, 97, 0.12)',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const type = {
  display: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  heading: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textMuted },
  caption: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textFaint,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

// Colour for a 0..1 progress value.
export const progressColor = (p) =>
  p >= 1 ? colors.accent : p > 0 ? colors.warn : colors.textFaint;
