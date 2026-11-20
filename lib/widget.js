// Safe entry point for the home-screen widgets.
// The widget library crashes on import when its native code is missing (Expo Go),
// so it is only loaded when the native module actually exists (installed APK).
import React from 'react';
import { Platform, TurboModuleRegistry, NativeModules } from 'react-native';

// Must match the widget names in app.json.
export const WIDGET_NAMES = ['ZeroBuddy', 'ZeroRing', 'ZeroToday'];

export const widgetAvailable =
  Platform.OS === 'android' &&
  !!(TurboModuleRegistry.get('AndroidWidget') || NativeModules.AndroidWidget);

const render = (name, summary) => {
  const { WIDGETS } = require('../widget/ZeroWidget');
  const Widget = WIDGETS[name] || WIDGETS.ZeroToday;
  return <Widget {...summary} />;
};

// Redraw every ZERO widget on the home screen with fresh numbers.
export const updateWidget = (summary) => {
  if (!widgetAvailable) return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    WIDGET_NAMES.forEach((name) =>
      requestWidgetUpdate({
        widgetName: name,
        renderWidget: () => render(name, summary),
      }).catch(() => {})
    );
  } catch (e) {
    console.log('widget update failed', e);
  }
};

// Called once from index.js so Android can refresh the widgets while the app is closed.
export const registerWidget = () => {
  if (!widgetAvailable) return;
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { loadSummary } = require('../widget/summary');

  registerWidgetTaskHandler(async ({ widgetInfo, widgetAction, renderWidget }) => {
    if (widgetAction === 'WIDGET_DELETED') return;
    const name = widgetInfo?.widgetName;
    try {
      renderWidget(render(name, await loadSummary()));
    } catch (e) {
      renderWidget(render(name, { hour: new Date().getHours() }));
    }
  });
};
