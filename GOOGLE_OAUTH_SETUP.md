# Google OAuth Login Setup Guide

## Current Status
- ✅ Account deletion implemented and ready to test
- ⚠️ Google login currently uses **simulated** authentication
- ❌ Real Google OAuth requires additional setup

## Steps to Implement Real Google OAuth

### 1. Install Required Packages

```bash
npm install @react-native-google-signin/google-signin
npm install @react-native-firebase/app @react-native-firebase/auth
```

### 2. Get Google Android Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client ID for Android:
   - Application type: Android
   - Package name: `com.beakbuddy.app`
   - SHA-1: Get from your keystore (see below)

#### Get SHA-1 Certificate Fingerprint:
```bash
# For debug keystore
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore (if you have one)
keytool -list -v -keystore android/app/release.keystore
```

### 3. Update .env File

Add the Android Client ID to `.env`:
```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

### 4. Update AuthContext.tsx

Replace the simulated `loginWithGoogle()` with:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

// In AuthProvider, add configuration
useEffect(() => {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
}, []);

const loginWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const { idToken } = await GoogleSignin.signIn();
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        const userCredential = await auth().signInWithCredential(googleCredential);
        setUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName
        });
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
};
```

### 5. Rebuild the App

After making these changes:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Alternative: Keep Simulated Login

If you prefer to keep the app working without Google OAuth setup:
- The current simulated login works fine for development
- Account deletion feature is fully functional
- You can implement real OAuth later when ready to publish

## Need Help?

If you encounter issues:
1. Verify package name matches in `android/app/build.gradle`
2. Ensure SHA-1 certificate is correctly added to Google Console
3. Check that Web Client ID is correct in `.env`
