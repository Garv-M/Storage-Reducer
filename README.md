# 📱 SwipeClean — Tinder for Your Photo Gallery

> Swipe left to delete, right to keep. Reclaim your storage one photo at a time.

SwipeClean is a React Native + Expo app that turns photo cleanup into a fast, satisfying swipe experience. Review photos full-screen, decide their fate with a flick, and safely stage deletions with a two-stage confirmation flow. Nothing is permanently removed until you explicitly confirm.

---

## What's Implemented (master branch)

This branch contains **Phase 0–2**: project bootstrap, the core swipe loop, trash management, and real OS deletion.

### ✅ Phase 0 — Bootstrap
- Expo SDK 54 + TypeScript (strict) + New Architecture enabled
- File-based routing via expo-router v6
- NativeWind v4 + Tailwind CSS with custom color palette
- Full project folder structure + path aliases (`@/*` → `src/*`)
- Provider tree: GestureHandler → SafeArea → QueryClient → Slot
- Bottom tabs: Home, Trash, Settings
- Git initialized with conventional commits

### ✅ Phase 1 — Core Swipe Loop (MVP)
- **4-direction swipe** — Left=Delete, Right=Keep, Up=Favorite, Down=Skip
- **Gesture engine** — velocity + distance thresholds (30% screen / 800 px/s)
- **SwipeCard** — full-screen photo via expo-image with pan gesture + rotation
- **SwipeStack** — 3 stacked cards with exit animation + next-card promotion
- **SwipeActionOverlay** — directional labels (DELETE/KEEP/FAVORITE/SKIP) tied to gesture
- **Undo stack** — 20-deep undo via button (no shake-undo yet on this branch)
- **Progress header** — "X of Y reviewed · Z MB freed" with progress bar
- **Metadata sheet** — bottom sheet showing date, size, album info
- **Zoomable photos** — pinch-to-zoom + double-tap zoom via Reanimated
- **Session management** — create, resume, complete sessions
- **MMKV persistence** — crash recovery, all state survives app kills
- **Cursor-based pagination** — streams asset IDs in chunks of 200
- **Auto-skip protected** — basic shouldAutoSkip() for favorites/hidden/shared
- **Onboarding** — welcome screen + permission request flow
- **Review grid** — FlashList 3-col grid of staged photos with checkboxes
- **Confirm modal** — count + size summary with destructive "Confirm Cleanup" button

### ✅ Phase 2 — Trash + Real Deletion
- **DeletionService** — batch OS deletion via `MediaLibrary.deleteAssetsAsync` (200/batch)
- **Two-stage delete** — staged → review → confirm → in-app trash → OS delete
- **In-app trash retention** — configurable 7/14/30 day holding period
- **Retention scheduler** — auto-deletes expired items on cold start + foreground
- **Restore from trash** — single or bulk restore back to gallery
- **Failed deletion tracking** — graceful fallback with single-item retry
- **Cloud detector** — identifies iCloud-only photos on iOS
- **Trash tab** — segmented control, expiry badges, multi-select, bulk actions
- **Stats dashboard** — total freed, photos reviewed, favorites count
- **Home screen** — resume session card, stats summary, trash warning banner
- **Settings** — retention picker (7/14/30), skip cloud-only toggle, failed deletions

### 🔲 Not on This Branch (available on `feat/phase-3-privacy-edge-cases`)
- App lock (PIN + biometric)
- Incognito mode
- Hidden album guard
- Shake-to-undo
- Live Photo / Burst / Video previews
- Photo grouping (burst, RAW+JPEG pairing)
- New photo nudge
- Streaks / gamification
- Dark mode
- Accessibility button row
- Session completion celebration
- Error boundaries
- UI primitives library

---

## Tech Stack

| Category            | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Framework**       | React Native 0.81 + Expo SDK 54                   |
| **Language**        | TypeScript 5.9 (strict mode)                      |
| **Routing**         | expo-router v6 (file-based, typed routes)          |
| **Gestures**        | react-native-gesture-handler + Reanimated 4        |
| **State**           | Zustand v5 + MMKV (encrypted, crash-safe)          |
| **Async Data**      | TanStack React Query v5                            |
| **Styling**         | NativeWind v4 (Tailwind CSS for RN)                |
| **Media**           | expo-media-library, expo-image                     |
| **Lists**           | @shopify/flash-list                                |
| **Sheets**          | @gorhom/bottom-sheet v5                            |
| **Validation**      | Zod v4                                             |

---

## Prerequisites

- **Node.js** ≥ 20 LTS
- **npm** ≥ 10
- **iOS:** Xcode 15+ (for simulator / device builds)
- **Android:** Android Studio + SDK 34+ (for emulator / device builds)

> ⚠️ This app requires a **custom dev client** (not Expo Go) because native modules like MMKV and media library deletion aren't available in Expo Go.

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

### 3. Generate native projects

```bash
npx expo prebuild
```

### 4. Run on iOS

```bash
# Simulator
npx expo run:ios

# Specific device
npx expo run:ios --device "iPhone 16 Pro"
```

### 5. Run on Android

```bash
# Emulator (must be running)
npx expo run:android

# Connected device
npx expo run:android --device
```

### 6. Development server (after first native build)

```bash
npx expo start --dev-client
```

Press `i` for iOS or `a` for Android.

---

## Project Structure

```
storage_reducer_app/
├── app/                           # expo-router file-based routes
│   ├── _layout.tsx                # Root providers + retention scheduler
│   ├── index.tsx                  # Entry → onboarding or home
│   ├── lock.tsx                   # 🔲 Stub (Phase 3)
│   ├── +not-found.tsx             # 404 screen
│   ├── stats.tsx                  # Stats page
│   ├── filters.tsx                # 🔲 Stub (v2)
│   ├── onboarding/
│   │   ├── welcome.tsx            # App intro
│   │   ├── permissions.tsx        # Media permission request
│   │   └── lock-setup.tsx         # 🔲 Stub (Phase 3)
│   ├── (tabs)/
│   │   ├── home.tsx               # Dashboard + start/resume session
│   │   ├── trash.tsx              # In-app trash with bulk actions
│   │   ├── settings.tsx           # Retention, cloud-only toggle
│   │   └── sessions.tsx           # 🔲 Stub (v2)
│   └── session/
│       ├── [sessionId].tsx        # ⭐ THE swipe screen
│       ├── review.tsx             # Staged photos grid
│       └── confirm.tsx            # Final confirmation
│
├── src/
│   ├── types/                     # Asset, Decision, Session
│   ├── constants/                 # Thresholds, retention, permissions
│   ├── utils/                     # format, log, platform, Result<T,E>
│   │
│   ├── stores/                    # Zustand + MMKV persistence
│   │   ├── sessionStore.ts        # Sessions, decisions, undo, resume
│   │   ├── trashStore.ts          # Staged + confirmed + retention
│   │   ├── statsStore.ts          # Freed bytes, reviewed, favorites
│   │   └── settingsStore.ts       # Retention, skipCloudOnly
│   │
│   ├── services/
│   │   ├── media/                 # MediaLibrary wrapper, pager, cloud detect
│   │   ├── deletion/              # DeletionService, retention, restore
│   │   └── persistence/           # MMKV instance, Zustand adapter, migrations
│   │
│   ├── features/
│   │   ├── swipe/components/      # SwipeCard, SwipeStack, overlays, zoom
│   │   ├── swipe/hooks/           # useSwipeGestures, useSessionQueue
│   │   ├── swipe/logic/           # thresholds, decisions, undoStack
│   │   ├── trash/components/      # TrashGrid, TrashItem, BulkActionBar
│   │   ├── review/components/     # ReviewGrid, SelectableThumb, ConfirmModal
│   │   └── stats/components/      # StatsDashboard
│   │
│   └── ui/theme/                  # colors.ts, typography.ts
│
└── tests/                         # unit, components, e2e (scaffolded)
```

---

## Architecture

```
 ┌──────────────────────────────────────────────────┐
 │  app/ screens — pure JSX + hooks                  │
 ├──────────────────────────────────────────────────┤
 │  features/<domain>/components + hooks             │  ← UI logic
 ├──────────────────────────────────────────────────┤
 │  stores/ (Zustand + MMKV)                         │  ← state
 ├──────────────────────────────────────────────────┤
 │  services/ (Media, Deletion, Persistence)         │  ← side effects
 ├──────────────────────────────────────────────────┤
 │  Native modules (expo-media-library, MMKV, etc.)  │
 └──────────────────────────────────────────────────┘
```

**Rules:**
1. Components use hooks → hooks read stores + call services
2. Components **never** import services directly
3. Services are pure TypeScript — no React
4. All persistent state through encrypted MMKV

**Provider Tree** (`app/_layout.tsx`):
```
GestureHandlerRootView
  └─ SafeAreaProvider
       └─ QueryClientProvider
            └─ CrashRecoveryGate
                 └─ Slot
```

---

## Swipe Gestures

| Direction | Action          | What Happens                               |
| --------- | --------------- | ------------------------------------------ |
| ← Left    | Delete (staged) | Moved to in-app review bin                 |
| → Right   | Keep            | Tagged as reviewed, skipped in future       |
| ↑ Up      | Favorite        | Protected, never shown again                |
| ↓ Down    | Skip for now    | "Can't decide" pile, revisit later          |

**Thresholds:** 30% screen width drag OR 800 px/s velocity.

---

## Two-Stage Delete Flow

```
  Photo in Queue
       │  swipe left
       ▼
  DELETE_STAGED (review bin)
       │  Review Grid → rescue or keep staged
       ▼
  Confirm Cleanup (modal: count + size)
       │  confirm
       ▼
  IN-APP TRASH (7/14/30 day retention)
       │  retention expires or user empties
       ▼
  OS deleteAssetsAsync() (native confirm)
       │
       ▼
  OS Recently Deleted (30 more days)
```

> We never copy photo bytes. "In-app trash" is just an intent record
> `{assetId, expiresAt}`. The photo stays in the OS gallery until final deletion.

---

## Configuration

### Colors (Tailwind / NativeWind)

| Token       | Hex       | Usage   |
| ----------- | --------- | ------- |
| `blue100`   | `#0053e2` | Primary |
| `spark100`  | `#ffc220` | Accent  |
| `red100`    | `#ea1100` | Error   |
| `green100`  | `#2a8703` | Success |

### Path Aliases

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
```

```bash
npx expo prebuild                  # Generate native dirs
npx expo run:ios                   # Build + run iOS
npx expo run:android               # Build + run Android
npx tsc --noEmit                   # Type-check
npx expo-doctor                    # Validate project config
```

---

## Environment Variables

```bash
cp .env.example .env
```

| Variable                       | Default       | Description                   |
| ------------------------------ | ------------- | ----------------------------- |
| `EXPO_PUBLIC_APP_ENV`          | `development` | `development` or `production` |
| `EXPO_PUBLIC_ENABLE_ANALYTICS` | `false`       | Enable analytics tracking     |

---

## Permissions

### iOS

| Permission                         | Reason                          |
| ---------------------------------- | ------------------------------- |
| `NSPhotoLibraryUsageDescription`   | Read photos for review          |
| `NSPhotoLibraryAddUsageDescription`| Restore/delete workflow         |
| `NSFaceIDUsageDescription`         | Biometric unlock (Phase 3)      |

### Android

| Permission         | Reason             |
| ------------------ | ------------------ |
| `READ_MEDIA_IMAGES`| Read photos        |
| `READ_MEDIA_VIDEO` | Read videos        |
| `USE_BIOMETRIC`    | Fingerprint (P3)   |

---

## Branches

| Branch                            | Content                                   |
| --------------------------------- | ----------------------------------------- |
| `master`                          | Phase 0–2: Bootstrap + Swipe + Trash      |
| `feat/phase-3-privacy-edge-cases` | Phase 0–4: Full v1 with privacy + polish  |

---

## Git Log

```
b5dbd4f  feat: Phase 2 - Trash, deletion, and stats
72a1c5d  feat: Phase 1 - MVP core swipe loop
0c1d389  Align Phase 0 bootstrap config and providers
1f5fb1c  Phase 0 bootstrap: Expo router, NativeWind, core deps
1be011a  Initial commit
```

---

## License

Private — all rights reserved.
