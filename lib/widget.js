// Safe entry point for the home-screen widget.
// The widget library crashes on import when its native code is missing (Expo Go),
// so it is only loaded when the native module actually exists (installed APK).
import React from 'react';
import { Platform, TurboModuleRegistry, NativeModules } from 'react-native';

export const WIDGET_NAME = 'ZeroToday';

export const widgetAvailable =
  Platform.OS === 'android' &&
  !!(TurboModuleRegistry.get('AndroidWidget') || NativeModules.AndroidWidget);

// Redraw any ZERO widgets on the home screen with fresh numbers.
export const updateWidget = (summary) => {
  if (!widgetAvailable) return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const { ZeroWidget } = require('../widget/ZeroWidget');
    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => <ZeroWidget {...summary} />,
    }).catch(() => {});
  } catch (e) {
    console.log('widget update failed', e);
  }
};

// Called once from index.js so Android can refresh the widget while the app is closed.
export const registerWidget = () => {
  if (!widgetAvailable) return;
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { ZeroWidget } = require('../widget/ZeroWidget');
  const { loadSummary } = require('../widget/summary');

  registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
    if (widgetAction === 'WIDGET_DELETED') return;
    try {
      renderWidget(<ZeroWidget {...(await loadSummary())} />);
    } catch (e) {
      renderWidget(<ZeroWidget />);
    }
  });
};
