# Firebase Deployment Script for Parrot Master

# IMPORTANT: This is a React Native/Expo app. Web deployment has limitations.
# Camera, haptics, and some native features won't work in browser.

# Step 1: Install Firebase CLI (one time only)
npm install -g firebase-tools

# Step 2: Login to Firebase
firebase login

# Step 3: Initialize Firebase in project
firebase init hosting

# When prompted:
# - Select "Use an existing project"
# - Choose "parrot-1fc71"
# - Public directory: "web-build"
# - Configure as single-page app: Yes
# - Set up automatic builds: No
# - Don't overwrite index.html if it exists

# Step 4: Build web version of the app
npx expo export:web

# Step 5: Deploy to Firebase Hosting
firebase deploy --only hosting

# Your app will be live at: https://parrot-1fc71.web.app
