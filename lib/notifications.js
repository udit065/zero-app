// Daily reminder to fill in progress. Local notifications only; nothing leaves the phone.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'daily-reminder';

export const DEFAULT_REMINDER = { enabled: true, hour: 21, minute: 30 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const formatTime = (hour, minute) => {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
};

// Returns true if notifications are allowed (asks once if needed).
export const ensurePermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
};

// Android needs a channel before notifications can show.
const ensureChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily reminder',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: '#4cc764',
  });
};

// A one-off notification a few seconds from now, to check reminders work.
export const sendTestNotification = async () => {
  if (!(await ensurePermission())) return false;
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ZERO · Test reminder',
      body: 'Reminders are working. See you tonight.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: CHANNEL_ID,
    },
  });
  return true;
};

// Replace any existing reminder with one matching `reminder`.
// Returns 'scheduled', 'off' or 'denied'.
export const applyReminder = async (reminder) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!reminder?.enabled) return 'off';

  if (!(await ensurePermission())) return 'denied';

  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ZERO · How did today go?',
      body: 'Take a minute to log your progress before the day ends.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: CHANNEL_ID,
    },
  });
  return 'scheduled';
};
