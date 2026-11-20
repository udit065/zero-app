// Shared UI building blocks.
import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, space, radius, type, progressColor } from '../lib/theme';

export const tap = () => Haptics.selectionAsync().catch(() => {});
export const success = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

export function ScreenHeader({ title, subtitle, right }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {!!subtitle && <Text style={type.caption}>{subtitle}</Text>}
        <Text style={type.display}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children, style }) {
  return <Text style={[type.caption, { marginBottom: space.sm }, style]}>{children}</Text>;
}

// Round checkbox. Shows a half state for partial progress.
export function Check({ progress = 0, size = 24 }) {
  const full = progress >= 1;
  const partial = progress > 0 && !full;
  return (
    <View
      style={[
        styles.check,
        { width: size, height: size, borderRadius: size / 2 },
        full && { backgroundColor: colors.accent, borderColor: colors.accent },
        partial && { borderColor: colors.warn },
      ]}>
      {full && <Ionicons name="checkmark" size={size * 0.65} color="#000" />}
      {partial && (
        <View
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: size,
            backgroundColor: colors.warn,
          }}
        />
      )}
    </View>
  );
}

export function ProgressBar({ value = 0, height = 6, color }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View
        style={{
          width: `${Math.round(v * 100)}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color || progressColor(v === 0 ? 0 : v >= 1 ? 1 : 0.5),
        }}
      />
    </View>
  );
}

export function Stepper({ value, target, unit, step, onChange }) {
  const p = Math.min(value, target) / target;
  return (
    <View style={styles.stepper}>
      <RoundButton icon="remove" onPress={() => onChange(value - step)} disabled={value <= 0} />
      <Text style={[styles.stepValue, { color: progressColor(p) }]}>
        {value}
        <Text style={styles.stepTarget}>
          /{target}
          {unit ? ` ${unit}` : ''}
        </Text>
      </Text>
      <RoundButton icon="add" onPress={() => onChange(value + step)} disabled={value >= target} />
    </View>
  );
}

export function RoundButton({ icon, onPress, disabled, size = 30, color = colors.text }) {
  return (
    <TouchableOpacity
      onPress={() => {
        tap();
        onPress();
      }}
      disabled={disabled}
      hitSlop={6}
      style={[
        styles.roundBtn,
        { width: size, height: size, borderRadius: size / 2 },
        disabled && { opacity: 0.3 },
      ]}>
      <Ionicons name={icon} size={size * 0.55} color={color} />
    </TouchableOpacity>
  );
}

export function Button({ title, icon, onPress, variant = 'primary', style, disabled }) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { opacity: 0.75 },
        disabled && { opacity: 0.4 },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={18} color={v.fg} style={{ marginRight: 6 }} />}
      <Text style={[styles.buttonText, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

const buttonVariants = {
  primary: { bg: colors.accent, fg: '#04140a', border: colors.accent },
  secondary: { bg: colors.surfaceHigh, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.textMuted, border: colors.border },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: 'transparent' },
};

export function Chip({ label, active, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.chip, active && styles.chipActive, style]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function EmptyState({ icon, title, text }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={type.heading}>{title}</Text>
      {!!text && <Text style={[type.small, { textAlign: 'center', marginTop: 4 }]}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: space.lg,
    marginTop: space.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: space.lg,
    marginBottom: space.md,
  },
  check: {
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { backgroundColor: colors.surfaceHigh, overflow: 'hidden', flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepValue: { fontSize: 15, fontWeight: '700', marginHorizontal: space.sm, minWidth: 64, textAlign: 'center' },
  stepTarget: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  roundBtn: {
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: space.lg,
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#04140a' },
  empty: { alignItems: 'center', paddingVertical: space.xxl },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
});
