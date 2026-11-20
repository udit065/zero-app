import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card, SectionLabel, RoundButton, Button, Chip, tap } from './ui';
import { colors, space, radius, type } from '../lib/theme';
import { formatTime, sendTestNotification } from '../lib/notifications';
import { QUOTES } from '../lib/quotes';
import { exportBackup, pickBackup } from '../lib/backup';
import { widgetAvailable } from '../lib/widget';

const PRESETS = [
  { label: '8:00 PM', hour: 20, minute: 0 },
  { label: '9:30 PM', hour: 21, minute: 30 },
  { label: '10:30 PM', hour: 22, minute: 30 },
];

export default function MoreScreen({
  reminder,
  setReminder,
  reminderStatus,
  config,
  history,
  today,
  onRestore,
}) {
  const [testMsg, setTestMsg] = useState('');
  const [backupMsg, setBackupMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const r = reminder;

  const doExport = async () => {
    tap();
    setBusy(true);
    setBackupMsg('');
    try {
      await exportBackup({ config, history, today });
      setBackupMsg(`Backup of ${Object.keys(history).length} days ready.`);
    } catch (e) {
      setBackupMsg('Could not create the backup.');
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    tap();
    setBackupMsg('');
    try {
      const backup = await pickBackup();
      if (!backup) return;
      Alert.alert(
        'Restore this backup?',
        `It has ${backup.days} days of history. Your current goals and history will be replaced. To-dos are kept.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: () => {
              onRestore(backup);
              setBackupMsg(`Restored ${backup.days} days.`);
            },
          },
        ]
      );
    } catch (e) {
      setBackupMsg(e.message || 'Could not read that file.');
    }
  };

  const shift = (minutes) => {
    const total = (r.hour * 60 + r.minute + minutes + 1440) % 1440;
    setReminder({ ...r, hour: Math.floor(total / 60), minute: total % 60 });
  };

  const test = async () => {
    tap();
    try {
      const ok = await sendTestNotification();
      setTestMsg(ok ? 'Sent. It should arrive in a few seconds.' : 'Notifications are blocked.');
    } catch (e) {
      setTestMsg('Could not send a test notification.');
    }
  };

  return (
    <View>
      <ScreenHeader subtitle="Settings & motivation" title="More" />

      <SectionLabel>Daily reminder</SectionLabel>
      <Card>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="notifications" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: space.md }}>
            <Text style={type.body}>Remind me to log progress</Text>
            <Text style={type.small}>
              {r.enabled ? `Every day at ${formatTime(r.hour, r.minute)}` : 'Off'}
            </Text>
          </View>
          <Switch
            value={r.enabled}
            onValueChange={(enabled) => {
              tap();
              setReminder({ ...r, enabled });
            }}
            trackColor={{ false: colors.surfaceHigh, true: colors.accentDark }}
            thumbColor={r.enabled ? colors.accent : colors.textMuted}
          />
        </View>

        {r.enabled && (
          <>
            <View style={styles.timeRow}>
              <RoundButton icon="remove" size={40} onPress={() => shift(-15)} />
              <Text style={styles.time}>{formatTime(r.hour, r.minute)}</Text>
              <RoundButton icon="add" size={40} onPress={() => shift(15)} />
            </View>
            <View style={[styles.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
              {PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  active={p.hour === r.hour && p.minute === r.minute}
                  onPress={() => setReminder({ ...r, hour: p.hour, minute: p.minute })}
                />
              ))}
            </View>
          </>
        )}

        {reminderStatus === 'denied' && r.enabled && (
          <View style={styles.warn}>
            <Ionicons name="alert-circle" size={18} color={colors.warn} />
            <Text style={styles.warnText}>
              Notifications are blocked for this app. Allow them in your phone settings.
            </Text>
            <TouchableOpacity onPress={() => Linking.openSettings()}>
              <Text style={styles.link}>Open</Text>
            </TouchableOpacity>
          </View>
        )}

        <Button
          title="Send a test notification"
          icon="paper-plane-outline"
          variant="secondary"
          onPress={test}
          style={{ marginTop: space.lg }}
        />
        {!!testMsg && <Text style={[type.small, styles.center]}>{testMsg}</Text>}
      </Card>

      <SectionLabel style={{ marginTop: space.lg }}>Backup</SectionLabel>
      <Card>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="cloud-upload" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: space.md }}>
            <Text style={type.body}>Your data lives only on this phone</Text>
            <Text style={type.small}>
              Save a backup file to Drive, WhatsApp or email. To-dos are not included.
            </Text>
          </View>
        </View>
        <View style={[styles.row, { marginTop: space.lg }]}>
          <Button
            title="Export"
            icon="download-outline"
            onPress={doExport}
            disabled={busy}
            style={{ flex: 1, marginRight: space.sm }}
          />
          <Button
            title="Import"
            icon="folder-open-outline"
            variant="secondary"
            onPress={doImport}
            disabled={busy}
            style={{ flex: 1 }}
          />
        </View>
        {!!backupMsg && <Text style={[type.small, styles.center]}>{backupMsg}</Text>}
      </Card>

      <SectionLabel style={{ marginTop: space.lg }}>Home-screen widget</SectionLabel>
      <Card style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="apps" size={18} color={colors.accent} />
        </View>
        <Text style={[type.small, { flex: 1, marginLeft: space.md }]}>
          {widgetAvailable
            ? 'Long-press your home screen → Widgets → ZERO, and pick a layout: Buddy (small, with streak), Ring (square) or Today (slim bar).'
            : 'Available in the installed app (APK), not in Expo Go. Once installed: long-press home screen → Widgets → ZERO.'}
        </Text>
      </Card>

      <SectionLabel style={{ marginTop: space.lg }}>Quotes</SectionLabel>
      {QUOTES.map((q) => (
        <View key={q.text} style={[styles.quote, q.primary && styles.quotePrimary]}>
          <Text style={[styles.quoteText, q.primary && styles.quoteTextPrimary]}>“{q.text}”</Text>
        </View>
      ))}

      <View style={styles.about}>
        <Text style={styles.aboutLogo}>ZERO</Text>
        <Text style={type.small}>Everyone starts from zero.</Text>
        <Text style={[type.small, { marginTop: 4, color: colors.textFaint }]}>
          Your data stays on this phone.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { textAlign: 'center', marginTop: space.sm },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xl,
    marginBottom: space.md,
  },
  time: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginHorizontal: space.xl,
    minWidth: 150,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warnSoft,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md,
  },
  warnText: { ...type.small, color: '#e8cf9f', flex: 1, marginHorizontal: space.sm },
  link: { color: colors.warn, fontWeight: '700' },
  quote: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    marginBottom: space.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  quotePrimary: { borderLeftColor: colors.accent },
  quoteText: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  quoteTextPrimary: { color: colors.text, fontWeight: '700' },
  about: { alignItems: 'center', marginTop: space.xxl },
  aboutLogo: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: 5, marginBottom: 4 },
});
