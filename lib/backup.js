// Export / import a backup file of goals and history.
// To-dos are deliberately left out: they are throwaway and never stored anywhere else.
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { migrateDay } from './zero';

const FORMAT = 'zero-backup';
const VERSION = 1;

export const exportBackup = async ({ config, history, today }) => {
  const data = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    config,
    history,
  };
  const file = new File(Paths.cache, `zero-backup-${today}.json`);
  file.create({ overwrite: true });
  await file.write(JSON.stringify(data));

  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save your ZERO backup',
  });
};

// Lets the user pick a backup file. Returns { config, history, days } or null if cancelled.
// Throws with a readable message if the file is not a valid backup.
export const pickBackup = async () => {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.length) return null;

  let data;
  try {
    data = JSON.parse(await new File(res.assets[0].uri).text());
  } catch {
    throw new Error('That file is not a ZERO backup.');
  }
  if (data?.format !== FORMAT || !data.config?.goals || typeof data.history !== 'object') {
    throw new Error('That file is not a ZERO backup.');
  }

  const history = {};
  Object.entries(data.history).forEach(([date, day]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) history[date] = migrateDay(day);
  });
  return { config: data.config, history, days: Object.keys(history).length };
};
