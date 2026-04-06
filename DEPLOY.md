# 🚀 Deploy Parrot Master to Firebase Hosting

## ⚠️ Prerequisites

**You must have Node.js installed first!**

1. Download from: https://nodejs.org/
2. Install the LTS version
3. Restart PowerShell after installation

## 📋 Deployment Steps

### Step 1: Install Dependencies

```powershell
cd c:\Users\Medicare\Desktop\Applications\Parrot
npm install
```

### Step 2: Install Firebase CLI

```powershell
npm install -g firebase-tools
```

### Step 3: Login to Firebase

```powershell
firebase login
```

This will open your browser. Login with your Google account.

### Step 4: Build Web Version

```powershell
npx expo export:web
```

This creates a `web-build` folder with the web version of your app.

**Note**: This may take 5-10 minutes and will show warnings about native modules not being available on web.

### Step 5: Deploy to Firebase

```powershell
firebase deploy --only hosting
```

### Step 6: Access Your App

Your app will be live at:
**https://parrot-1fc71.web.app**

Or the Firebase Hosting URL shown in the deployment output.

## ⚠️ Important Limitations

Since this is a React Native app being deployed as a web app, some features **will not work**:

### ❌ Won't Work in Browser:
- **Camera scanning** (expo-camera) - Browser camera API is different
- **Haptic feedback** (expo-haptics) - No browser support
- **Native audio recording** - May have limited support
- **SQLite database** - Will use web alternative (may be slower)

### ✅ Will Work in Browser:
- Navigation and UI
- Theme switching
- Text-to-speech (with browser TTS)
- Most visual features
- Games (with keyboard/mouse instead of touch)
- Coin economy and store

## 🔄 Alternative: Better Mobile Experience

For the **full experience with all features**, use Expo Go:

```powershell
# Publish to Expo
npx expo publish

# Users scan QR code with Expo Go app on their phone
```

This gives you:
- ✅ Camera scanning
- ✅ Haptic feedback  
- ✅ Full audio recording
- ✅ Native performance
- ✅ All features working

## 🐛 Troubleshooting

### "firebase: command not found"
```powershell
npm install -g firebase-tools
```

### "expo: command not found"  
```powershell
npm install -g expo-cli
```

### Build fails
- Make sure all dependencies are installed: `npm install`
- Clear cache: `npx expo start -c`

### Deployment fails
- Check you're logged in: `firebase login`
- Verify project ID: `firebase projects:list`

## 📊 What Happens During Build

1. **Expo analyzes** your React Native code
2. **Converts** native modules to web equivalents where possible
3. **Bundles** JavaScript, CSS, and assets
4. **Creates** optimized production build in `web-build/`
5. **Firebase uploads** the build to hosting servers

## ✅ Verification

After deployment, test these features:

1. **Start screen** loads
2. **Mode selection** works
3. **Navigation** between screens
4. **Theme toggle** (Light/Dark)
5. **Database** loads species and foods
6. **Search** functionality
7. **Games** are playable with mouse/keyboard

---

**Ready to deploy?** Make sure Node.js is installed, then run the commands above!
