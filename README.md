# Parrot Master

A complete, production-ready cross-platform mobile app (Android + iOS) for parrot owners and enthusiasts.

## Features

### 🦜 Parrot Owner Mode
- **Species Selection**: Browse and search 50 parrot species with detailed information
- **Profile Creation**: Create personalized profiles for your parrots
- **Food Safety**: Search 20+ food items with safety verdicts, symptoms, and serving tips
- **Camera Scan**: Scan food items with your camera or manual input
- **Lists**: Browse categorized safe/toxic food lists
- **Care Tracking**: Training plans, diet plans, and daily care task checklists
- **Theme Toggle**: Light, Dark, and System theme modes

### 🎮 Talking Parrot Mode
- **Talk & Repeat**: Record audio and hear TTS playback
- **Customize**: 24 combinations (6 body colors × 4 beak colors + 4 hat options)
- **Scenes**: 6 different background scenes
- **Dance**: Animated parrot with music
- **Sleep**: Sleep timer with 5/15/30 minute options
- **Poke**: Interactive touch zones with haptic feedback
- **Fly Mode**: Joystick-controlled flying game with coin collection
- **Rings Challenge**: Pass through rings to earn coins
- **Obstacles Runner**: Endless flap game with obstacles
- **Mini Games**: Memory Cards, Tap the Treat, Sound Match
- **Coin Store**: Purchase cosmetics with earned coins

## Tech Stack

- **Framework**: React Native + Expo SDK 51
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Database**: SQLite (expo-sqlite) with repository pattern
- **Storage**: AsyncStorage for settings and preferences
- **Camera**: expo-camera with permission handling
- **Audio**: expo-av for recording and playback
- **Speech**: expo-speech for text-to-speech
- **Haptics**: expo-haptics for tactile feedback

## Design

- **Style**: Modern "Soft Pop + Accessible Neumorphism"
- **Colors**: Brand Purple (#8040BF), Coral (#FF6B6B), Safe (#00C853), Toxic (#FF1744)
- **Accessibility**: Min 44px touch targets, high contrast, readable text
- **Themes**: Light, Dark, and System modes with persistent storage

## Setup

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

## Database

The app includes a complete SQLite database with:
- **50 Parrot Species**: From Budgerigar to Meyer's Conure with scientific names and popularity rankings
- **20 Food Items**: Comprehensive safety information including verdicts, confidence scores, symptoms, and serving tips
- **User Data**: Profiles, training plans, diet plans, care tasks, and user-marked foods

## Project Structure

```
parrot-master/
├── assets/              # Images (icon, splash, species, patterns)
├── src/
│   ├── components/      # Reusable UI components
│   ├── database/        # SQLite schema, seed data, repository
│   ├── navigation/      # Navigation structure
│   ├── screens/         # All app screens
│   │   ├── owner/       # Owner Mode screens
│   │   └── talking/     # Talking Parrot Mode screens
│   ├── theme/           # Theme system and context
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── App.tsx              # App entry point
└── package.json         # Dependencies
```

## Permissions

The app requires the following permissions:
- **Camera**: For scanning food items (Owner Mode)
- **Microphone**: For Talk & Repeat feature (Talking Parrot Mode)
- **Speech Recognition**: For voice interactions (iOS)

All permissions are requested at runtime with graceful fallbacks.

## Notes

- Speech-to-text is simulated as Expo doesn't provide direct STT API
- All 50 species are seeded on first launch
- Theme preference persists across app restarts
- Coin economy and purchases are saved locally

## License

MIT
