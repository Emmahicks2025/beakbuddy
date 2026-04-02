const authArg = require('@react-native-firebase/auth');
console.log('Default Export Keys:', Object.keys(authArg));
console.log('Is GoogleAuthProvider on Default?', !!authArg.default.GoogleAuthProvider);
console.log('Is GoogleAuthProvider on Named Export?', !!authArg.GoogleAuthProvider);

try {
    const firebase = require('@react-native-firebase/app');
    console.log('Firebase App Keys:', Object.keys(firebase));
} catch (e) {
    console.log('Could not require app:', e.message);
}
