import { registerRootComponent } from 'expo';

import App from './App';
import { registerWidget } from './lib/widget';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Home-screen widget refreshes (no-op in Expo Go).
registerWidget();
