# 📱 SwipeClean — Tinder for Your Photo Gallery

> Swipe left to delete, right to keep. Reclaim your storage one photo at a time.

SwipeClean is a React Native + Expo mobile app that turns photo cleanup into a fast, satisfying experience. Review photos full-screen, swipe in four directions to decide their fate, and safely delete with a two-stage confirmation flow. Nothing is permanently removed until you say so.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Swipe Gestures](#swipe-gestures)
- [Two-Stage Delete Flow](#two-stage-delete-flow)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Permissions](#permissions)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Swipe Loop
- ⬅️ **Swipe Left** → Stage photo for deletion (never deletes immediately)
- ➡️ **Swipe Right** → Keep photo, skip in future reviews
- ⬆️ **Swipe Up** → Favorite / protect (never shown again)
- ⬇️ **Swipe Down** → Skip for now ("can't decide" pile)
- 🔍 **Pinch-to-zoom** and **double-tap zoom** before deciding
- 📋 **Long-press** to view metadata (date, size, location, album)

### Safety & Anti-Misclick
- 🛡️ **Two-stage delete** — swipe only stages; confirm explicitly
- ↩️ **Undo** — last 20 swipes (button + shake-to-undo)
- 📊 **Review grid** — see all staged photos before confirming
- 🗑️ **In-app trash** — 7/14/30 day retention before actual OS deletion
- 🔄 **Restore from trash** — multi-select bulk restore
- 🎯 **Velocity threshold** — requires 30% screen width swipe (no accidental triggers)
- 💾 **Crash recovery** — state persisted to MMKV; resume exactly where you left off

### Privacy & Security
- 🔐 **App lock** — PIN + Face ID / Touch ID / fingerprint
- 🕶️ **Incognito mode** — no history tracked, decisions ephemeral
- 🔒 **Hidden album guard** — re-authenticate for sensitive content
- 📵 **No backend** — everything runs on-device, no data leaves your phone

### Media Support
- 📸 Live Photos — still + motion preview
- 📷 Burst photos — horizontal pager, grouped decisions
- 🎥 Videos — thumbnail + tap-to-play (no autoplay)
- ☁️ iCloud/cloud-only — detection + warning badges
- 📂 Shared albums — auto-skipped (read-only)

### Progress & Gamification
- 📈 Real-time progress bar ("247 of 4,832 reviewed · 1.2 GB freed")
- 🔥 Daily streaks
- 📊 Stats dashboard (all-time freed, reviewed, favorites, sessions)
- 🔔 New photo nudges ("184 new photos since last cleanup!")

### Accessibility
- ♿ Full VoiceOver / TalkBack support
- 🔘 Alternative button row (Delete / Skip / Keep / Favorite) for motor accessibility
- 🎨 WCAG 2.2 AA contrast compliance
- 🌙 Dark mode support (system / light / dark)

---

## Tech Stack

| Category            | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Framework**       | React Native 0.81 + Expo SDK 54                   |
| **Language**        | TypeScript 5.9 (strict mode)                      |
| **Routing**         | expo-router v6 (file-based)                       |
| **Gestures**        | react-native-gesture-handler + Reanimated 4       |
| **State**           | Zustand v5 + MMKV (encrypted, crash-safe)         |
| **Async Data**      | TanStack React Query v5                           |
| **Styling**         | NativeWind v4 (Tailwind CSS for RN)               |
| **Media**           | expo-media-library, expo-image, expo-video         |
| **Auth**            | expo-local-authentication + expo-secure-store      |
| **Lists**           | @shopify/flash-list                               |
| **Sheets**          | @gorhom/bottom-sheet v5                           |
| **Validation**      | Zod v4                                            |
| **Architecture**    | New Architecture (Fabric + TurboModules) enabled   |

---

## Prerequisites

- **Node.js** ≥ 20 LTS
- **npm** ≥ 10
- **Expo CLI** (comes with `npx expo`)
- **iOS:** Xcode 15+ (for simulator / device builds)
- **Android:** Android Studio + SDK 34+ (for emulator / device builds)
- **EAS CLI** (optional, for cloud builds): `npm install -g eas-cli`

> ⚠️ This app uses a **custom dev client** (not Expo Go) because it requires native modules like MMKV, media library deletion, and biometric authentication.

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd storage_reducer_app
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` as needed (see [Environment Variables](#environment-variables)).

### 3. Generate native projects

```bash
npx expo prebuild
```

### 4. Run on iOS

```bash
# Simulator
npx expo run:ios

# Or with a specific simulator
npx expo run:ios --device "iPhone 16 Pro"
```

### 5. Run on Android

```bash
# Emulator (must be running)
npx expo run:android

# Or on a connected device
npx expo run:android --device
```

### 6. Development server (after initial native build)

```bash
npx expo start --dev-client
```

Then press `i` for iOS or `a` for Android in the terminal.

---

## Project Structure

```
storage_reducer_app/
├── app/                           # Expo Router — file-based routes
│   ├── _layout.tsx                # Root providers (Gesture, SafeArea, Query, Theme)
│   ├── index.tsx                  # Entry redirect → onboarding or home
│   ├── lock.tsx                   # App lock screen (PIN + biometric)
│   ├── +not-found.tsx             # 404 screen
│   ├── stats.tsx                  # Full stats dashboard
│   ├── onboarding/
│   │   ├── welcome.tsx            # Intro + "Get Started"
│   │   ├── permissions.tsx        # Media library permission request
│   │   └── lock-setup.tsx         # PIN + biometric setup
│   ├── (tabs)/                    # Bottom tab navigator
│   │   ├── home.tsx               # Dashboard, start/resume session
│   │   ├── trash.tsx              # In-app trash with bulk actions
│   │   ├── stats.tsx              # Stats tab entry
│   │   └── settings.tsx           # Retention, lock, incognito, auto-skip
│   └── session/
│       ├── [sessionId].tsx        # ⭐ THE swipe screen
│       ├── review.tsx             # Pre-confirm deletion grid
│       └── confirm.tsx            # Final confirmation modal
│
├── src/
│   ├── types/                     # TypeScript types (Asset, Decision, Session)
│   ├── constants/                 # Thresholds, retention, permission strings
│   ├── utils/                     # format, logging, platform, Result type
│   │
│   ├── stores/                    # Zustand stores (MMKV-persisted)
│   │   ├── sessionStore.ts        # Session state, decisions, undo, crash recovery
│   │   ├── trashStore.ts          # Staged + confirmed trash with retention
│   │   ├── statsStore.ts          # All-time stats + streaks
│   │   ├── settingsStore.ts       # User preferences
│   │   └── lockStore.ts           # Lock state (memory only)
│   │
│   ├── services/                  # Pure TS — no React
│   │   ├── media/                 # Gallery access, pagination, grouping
│   │   ├── deletion/              # Two-stage delete, retention scheduler
│   │   ├── auth/                  # PIN hash, biometric, app lock
│   │   ├── analytics/             # Tracker (no-op in incognito)
│   │   └── persistence/           # MMKV instance, schema migrations
│   │
│   ├── features/                  # Domain-grouped UI components + hooks
│   │   ├── swipe/                 # SwipeCard, SwipeStack, gestures, zoom
│   │   ├── trash/                 # TrashGrid, BulkActionBar
│   │   ├── review/                # ReviewGrid, ConfirmModal
│   │   ├── lock/                  # PinPad, useAppLock
│   │   ├── stats/                 # StatsDashboard
│   │   ├── nudges/                # NewPhotoNudge
│   │   └── session/               # SessionCompletionCard
│   │
│   └── ui/                        # Design system
│       ├── theme/                 # Colors (Walmart palette), typography
│       └── primitives/            # Button, Card, Modal, Toast, etc.
│
├── tests/                         # Unit, component, and E2E tests
├── app.config.ts                  # Expo config (replaces app.json)
├── tailwind.config.js             # NativeWind / Tailwind theme
├── babel.config.js                # Reanimated + NativeWind plugins
├── metro.config.js                # NativeWind metro integration
└── tsconfig.json                  # Strict TS + path aliases (@/*)
```

---

## Architecture

```
 ┌──────────────────────────────────────────────────┐
 │  app/ (expo-router screens) — pure JSX + hooks    │
 ├──────────────────────────────────────────────────┤
 │  features/<domain>/components + hooks             │  ← UI logic
 ├──────────────────────────────────────────────────┤
 │  stores/<domain>Store.ts (Zustand + MMKV)         │  ← state
 ├──────────────────────────────────────────────────┤
 │  services/* (Media, Deletion, Auth, Persistence)  │  ← side effects
 ├──────────────────────────────────────────────────┤
 │  Native modules (expo-media-library, MMKV, etc.)  │
 └──────────────────────────────────────────────────┘
```

### Rules

1. **Components** use hooks → hooks read stores + call services.  
   Components **never** import services directly.
2. **Services** are pure TypeScript — no React, easy to unit-test.
3. **Stores** hold state, not behavior. Services mutate via setter actions.
4. **All persistent state** flows through encrypted MMKV.

### Provider Tree (`app/_layout.tsx`)

```
GestureHandlerRootView
  └─ SafeAreaProvider
       └─ QueryClientProvider
            └─ AppLockGate (renders /lock if locked)
                 └─ CrashRecoveryGate (resumes sessions)
                      └─ Slot (expo-router children)
```

---

## Swipe Gestures

| Direction | Action          | What Happens                              |
| --------- | --------------- | ----------------------------------------- |
| ← Left    | Delete (staged) | Moved to in-app review bin                |
| → Right   | Keep            | Tagged as reviewed, skipped in future      |
| ↑ Up      | Favorite        | Protected, never shown again               |
| ↓ Down    | Skip for now    | "Can't decide" pile, revisit later         |

**Thresholds:** Minimum 30% screen width drag OR 800 px/s velocity to register.

**While zoomed:** Swipe gestures are disabled — pinch/pan controls the photo instead.

---

## Two-Stage Delete Flow

```
  Photo in Queue
       │ swipe left
       ▼
  DELETE_STAGED (in-app review bin)
       │ open Review Grid → rescue or keep staged
       ▼
  Confirm Cleanup (modal with count + size)
       │ confirm
       ▼
  IN-APP TRASH (retention: 7/14/30 days)
       │ retention expires or user empties
       ▼
  OS deleteAssetsAsync() (native confirm dialog)
       │
       ▼
  OS Recently Deleted (30 more days, OS-managed)
```

> **Key:** We never copy photo bytes. "In-app trash" is just an intent record  
> (`{assetId, expiresAt}`). The photo stays in the OS gallery until final deletion.

---

## Configuration

### `app.config.ts`

The Expo configuration lives in `app.config.ts` (not `app.json`). Key settings:

- `newArchEnabled: true` — Fabric + TurboModules
- `scheme: 'storage-reducer-app'` — deep linking
- `experiments.typedRoutes: true` — type-safe routing

### `tailwind.config.js`

Custom color palette:

| Token       | Hex       | Usage        |
| ----------- | --------- | ------------ |
| `blue100`   | `#0053e2` | Primary      |
| `spark100`  | `#ffc220` | Accent       |
| `red100`    | `#ea1100` | Error        |
| `green100`  | `#2a8703` | Success      |

### Path Aliases

The project uses `@/*` → `src/*` path aliases:

```ts
import { useSessionStore } from '@/stores/sessionStore';
import { classifySwipe } from '@/features/swipe/logic/swipeThresholds';
```

---

## Scripts

```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in browser (limited support)
```

### Additional commands

```bash
npx expo prebuild                  # Generate ios/ and android/ native dirs
npx expo run:ios                   # Build + run on iOS (requires Xcode)
npx expo run:android               # Build + run on Android (requires SDK)
npx tsc --noEmit                   # Type-check without emitting
npx expo-doctor                    # Validate project configuration
npx eas build --platform ios       # Cloud build via EAS (requires account)
npx eas build --platform android   # Cloud build via EAS
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable                       | Default       | Description                    |
| ------------------------------ | ------------- | ------------------------------ |
| `EXPO_PUBLIC_APP_ENV`          | `development` | `development` or `production`  |
| `EXPO_PUBLIC_ENABLE_ANALYTICS` | `false`       | Enable analytics tracking      |

> All client-accessible env vars must be prefixed with `EXPO_PUBLIC_`.

---

## Permissions

The app requires the following device permissions:

### iOS (`Info.plist` via `app.config.ts`)

| Permission                         | Reason                                   |
| ---------------------------------- | ---------------------------------------- |
| `NSPhotoLibraryUsageDescription`   | Read photos for review queue             |
| `NSPhotoLibraryAddUsageDescription`| Restore/delete workflow                  |
| `NSFaceIDUsageDescription`         | Biometric unlock                         |

### Android (`AndroidManifest.xml` via `app.config.ts`)

| Permission           | Reason                   |
| -------------------- | ------------------------ |
| `READ_MEDIA_IMAGES`  | Read photos              |
| `READ_MEDIA_VIDEO`   | Read videos              |
| `USE_BIOMETRIC`      | Fingerprint unlock       |

---

## Testing

```bash
# Type-check
npx tsc --noEmit

# Unit tests (when configured)
npm test

# E2E tests with Maestro (when configured)
maestro test tests/e2e/
```

### Test directories

```
tests/
├── unit/          # Pure logic tests (swipeThresholds, undoStack, etc.)
├── components/    # React component tests with Testing Library
└── e2e/           # Maestro flow files (.yaml)
```

---

## Building for Production

### Using EAS Build (recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build profiles
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Local builds

```bash
# iOS (requires Xcode + Apple Developer account)
npx expo run:ios --configuration Release

# Android (generates APK/AAB)
npx expo run:android --variant release
```

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, etc.
3. Keep files under 600 lines. Split if needed, but don't sacrifice cohesion.
4. Run `npx tsc --noEmit` before committing.
5. Add accessibility labels to all interactive elements.
6. Ensure WCAG 2.2 AA contrast (4.5:1 text, 3:1 UI).

---

## License

Private — all rights reserved.
