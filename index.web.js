import { registerRootComponent } from 'expo';
import App from './App';

// Unregister service workers to prevent blank screen issues due to caching/stale SWs
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
            registration.unregister();
            console.log('ServiceWorker unregistered');
        }
    }).catch((err) => {
        console.error('ServiceWorker unregistration failed: ', err);
    });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
