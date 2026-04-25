# Storage Reducer — Architecture & Business Logic

## Overview

Storage Reducer is a **React Native (Expo SDK 54)** mobile app that helps users free up device storage by swiping through their photo library, staging unwanted photos for deletion, reviewing them, and then permanently deleting them after a configurable retention period. Think of it as "Tinder for your photos."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 via Expo SDK 54 |
| Routing | expo-router v6 (file-based) |
| State Management | Zustand (persisted via MMKV) |
| Persistence | react-native-mmkv (encrypted) |
| Gestures | react-native-gesture-handler + react-native-reanimated v4 |
| Async Data | @tanstack/react-query |
| Media Access | expo-media-library |
| Styling | NativeWind v4 (Tailwind CSS) + inline styles |
| Auth | expo-local-authentication + expo-secure-store + expo-crypto |

---

## Directory Structure

```
app/                          # expo-router file-based screens
├── _layout.tsx               # Root layout (providers, crash recovery, retention scheduler)
├── index.tsx                 # Entry redirect (onboarding or home)
├── lock.tsx                  # App lock screen
├── filters.tsx               # Filter selection screen
├── stats.tsx                 # Full stats screen
├── +not-found.tsx            # 404 fallback
├── (tabs)/                   # Main tab navigator
│   ├── _layout.tsx           # Tab bar config (Home, Trash, Settings)
│   ├── home.tsx              # Dashboard — start/resume sessions
│   ├── trash.tsx             # Manage confirmed trash items
│   └── settings.tsx          # Retention, cloud-skip, failed deletions
├── onboarding/               # First-run flow
│   ├── _layout.tsx           # Stack navigator
│   ├── welcome.tsx           # Welcome screen
│   ├── permissions.tsx       # Photo library permission request
│   └── lock-setup.tsx        # PIN/biometric setup (placeholder)
└── session/                  # Active review session
    ├── _layout.tsx           # Stack navigator
    ├── [sessionId].tsx       # Swipe review screen (core UX)
    ├── review.tsx            # Review staged items grid
    └── confirm.tsx           # Confirm staged → trash

src/
├── constants/                # App-wide constants
│   ├── permissions.ts        # Permission copy strings
│   ├── retention.ts          # Retention options (7, 14, 30 days)
│   └── thresholds.ts        # Swipe thresholds, undo cap, rotation factor
├── features/                 # Feature modules (components + hooks + logic)
│   ├── lock/                 # App lock (PIN pad, biometric)
│   ├── nudges/               # New photo nudges
│   ├── review/               # Post-session review grid + confirm modal
│   ├── stats/                # Stats dashboard
│   ├── swipe/                # Core swipe engine (cards, gestures, queue)
│   └── trash/                # Trash grid, bulk actions
├── services/                 # Business logic layer (no UI)
│   ├── analytics/            # Event tracker
│   ├── auth/                 # PIN hashing, biometric, AppLockService
│   ├── deletion/             # DeletionService, restore, retention scheduler
│   ├── media/                # MediaLibrary wrapper, pager, cloud/protected detection
│   └── persistence/          # MMKV instance, Zustand storage adapter, migrations
├── stores/                   # Zustand state stores
│   ├── sessionStore.ts       # Session CRUD, decisions, undo
│   ├── trashStore.ts         # Staged → confirmed trash lifecycle
│   ├── settingsStore.ts      # User preferences
│   ├── statsStore.ts         # Aggregate stats (freed bytes, reviewed, etc.)
│   ├── lockStore.ts          # Lock state (locked, enabled, biometric)
│   └── entitlementsStore.ts  # Feature gating
├── types/                    # TypeScript interfaces
│   ├── asset.ts              # Asset, AssetKind, AssetId
│   ├── session.ts            # Session shape
│   └── decision.ts           # Decision enum + DecisionRecord
├── ui/                       # Design system
│   ├── primitives/           # Button, Card, Modal, Toast, etc.
│   └── theme/                # Colors, typography tokens
└── utils/                    # Helpers (format, log, platform, Result type)
```

---

## App Lifecycle & Navigation Flow

```
App Launch
    │
    ├── runMigrations()              ← MMKV schema versioning
    ├── useRetentionScheduler()      ← auto-delete expired trash on foreground
    ├── CrashRecoveryGate            ← resume interrupted session
    │
    └── index.tsx (redirect)
            │
            ├── NOT onboarded → /onboarding/welcome
            │       └── /onboarding/permissions
            │               └── Grant → setOnboarded(true) → /(tabs)/home
            │
            └── onboarded → /(tabs)/home
                    │
                    ├── "Start Review" → createSession() → /session/{id}
                    ├── "Resume"       → setActiveSession() → /session/{id}
                    ├── Tab: Trash     → /(tabs)/trash
                    └── Tab: Settings  → /(tabs)/settings
```

---

## Core Business Logic

### 1. Session Lifecycle (`sessionStore.ts` + `session/[sessionId].tsx`)

A **Session** is the central concept. It represents one photo review sitting.

```
createSession()
    → generates unique ID (session_{timestamp}_{random})
    → sets as activeSessionId
    → initializes empty decisions[], undoStack[], queueIds[]

During review (swipe or button tap):
    recordDecision(assetId, decision, bytesFreed)
        → appends to session.decisions[]
        → pushes to session.undoStack[] (capped at 20)
        → if DELETE_STAGED: adds bytesFreed estimate

    undo()
        → pops last from undoStack
        → removes matching record from decisions[]

Session complete:
    completeSession()
        → sets completedAt timestamp
        → clears activeSessionId

findResumable()
    → returns the latest session without completedAt
```

**Session type:**
```ts
interface Session {
  id: string;
  createdAt: number;
  filterId?: string;         // optional album/filter
  cursor?: string | null;    // pagination cursor for media library
  queueIds: AssetId[];       // all asset IDs loaded so far
  decisions: DecisionRecord[];
  undoStack: DecisionRecord[];  // last 20 decisions (for undo)
  freedBytesEstimated: number;
  incognito: boolean;        // don't track stats
  completedAt?: number;
}
```

### 2. Swipe Engine (`features/swipe/`)

The swipe system is the core UX. It has several layers:

#### Gesture Recognition (`useSwipeGestures.ts` → `swipeThresholds.ts`)
- Uses `Gesture.Pan()` from react-native-gesture-handler
- Tracks `translationX`, `translationY` via Reanimated shared values
- On gesture end, `classifySwipe()` determines the decision:

| Direction | Decision | Meaning |
|---|---|---|
| ← Left | `DELETE_STAGED` | Stage for deletion |
| → Right | `KEEP` | Keep the photo |
| ↑ Up | `FAVORITE` | Mark as favorite |
| ↓ Down | `SKIP_LATER` | Skip for now |

- Qualification: displacement > 30% of screen dimension OR velocity > 800
- If neither threshold met → spring back (no decision)

#### Card Stack (`SwipeStack.tsx` → `SwipeCard.tsx`)
- Renders top 3 cards in a stacked layout (scale: 1.0, 0.94, 0.90)
- Only the top card is interactive (`pointerEvents="auto"`)
- Burst groups are collapsed (one card per group)
- On swipe complete → advance `currentIndex`, notify parent

#### Session Queue (`useSessionQueue.ts`)
- Loads photos from device library in pages of 200
- Converts Expo MediaLibrary assets → app `Asset` type via `AssetTypes.ts`
- Detects cloud-only photos via `cloudDetector.ts`
- Optionally filters out cloud-only items based on settings
- Auto-loads next page when remaining assets < 40

#### Supporting Components
- **SwipeActionOverlay** — colored overlay showing swipe direction
- **ZoomablePhoto** — pinch-to-zoom photo viewer
- **VideoPreview** — video playback card
- **LivePhotoPreview** — live photo still + motion
- **BurstGroupPreview** — burst photo group display
- **MetadataSheet** — long-press bottom sheet with file info
- **UndoButton** — undo last swipe decision
- **ProgressHeader** — reviewed count + freed bytes estimate

### 3. Trash & Deletion Pipeline (`trashStore.ts` → `DeletionService.ts`)

The deletion system has a **3-stage safety pipeline**:

```
Stage 1: STAGED (in-memory during session)
    ← Swipe left (DELETE_STAGED)
    → addStaged(asset) in trashStore
    → Can be undone during session
    → Can be reviewed in /session/review

Stage 2: CONFIRMED (persisted, retention timer starts)
    ← User taps "Confirm" on /session/confirm
    → DeletionService.confirmStaged(sessionId)
        → trashStore.confirmStaged(retentionDays)
            → moves staged → confirmed[]
            → sets expiresAt = now + retentionDays
        → completeSession()
        → incrementSessionsCompleted()

Stage 3: DELETED (permanent, via OS API)
    ← Retention timer expires OR user taps "Delete Now"
    → DeletionService.executeDelete(assetIds)
        → expo-media-library deleteAssetsAsync()
        → batched in groups of 200
        → failed items → individual retry
        → successful → removeConfirmed() + addFreedBytes()
        → failed → addFailedDeletions() + alert user
```

**Retention Scheduler (`retentionScheduler.ts`):**
- Runs on app launch and every time app returns to foreground
- Checks `confirmed[]` for items where `expiresAt <= now`
- Auto-deletes expired items via `DeletionService.executeDelete()`

**Restore (`restore.ts`):**
- `restoreFromTrash(assetIds)` → removes from confirmed + records KEEP decision
- Available from the Trash tab's bulk action bar

### 4. Persistence Layer (`services/persistence/`)

```
MMKV (react-native-mmkv)
    ├── Encrypted with static key
    ├── Instance: 'storage-reducer-mmkv'
    │
    └── zustandStorage adapter
            ├── Wraps MMKV as Zustand StateStorage
            ├── Optional debounce (sessionStore uses 250ms)
            └── Used by all persisted stores

Persisted stores:
    ├── session-store-v1   (sessions, activeSessionId)     [debounced 250ms]
    ├── trash-store-v1     (staged, confirmed, failed)
    ├── settings-store-v1  (retention, theme, autoSkip, onboarded)
    └── stats-store-v1     (totalFreedBytes, photosReviewed, etc.)
```

**Migrations (`migrations.ts`):**
- Schema versioned via `app_schema` key in MMKV
- `runMigrations()` called at module level in root layout (before any render)
- Currently at schema version 1 (no migrations yet, placeholder for future)

### 5. Media Service Layer (`services/media/`)

| Module | Purpose |
|---|---|
| `MediaLibrary.ts` | Thin wrapper over `expo-media-library` (getAssets, getAssetInfo, deleteAssetsAsync) |
| `AssetTypes.ts` | Converts Expo `Asset` → app `Asset` type with enriched metadata |
| `pager.ts` | `streamAssetIds()` — paginated asset ID streaming with chunk callbacks |
| `albums.ts` | Album listing and membership |
| `cloudDetector.ts` | Detects iCloud-only photos (iOS only, checks `localUri == null`) |
| `protectedDetector.ts` | `shouldAutoSkip()` — skip hidden/cloud-only/shared based on settings |
| `grouping.ts` | (Empty — placeholder for burst/live-photo grouping logic) |

### 6. Auth & App Lock (`services/auth/` + `stores/lockStore.ts`)

```
AppLockService
    ├── initialize()      → load lock state from SecureStore into lockStore
    ├── setupLock(pin)    → hash PIN with SHA-256 + random salt, save to SecureStore
    ├── unlock('pin')     → verify PIN hash
    ├── unlock('biometric') → expo-local-authentication
    └── shouldLock()      → check if 30s have passed since backgrounding

PIN Storage (SecureStore):
    ├── pin.salt   → 16-byte random hex
    ├── pin.hash   → SHA-256(salt:pin)
    └── pin.length → PIN digit count

Lock Flow:
    Root Layout checks isLockEnabled && isLocked
        → true:  render LockScreenContent (PIN pad + biometric)
        → false: render <Slot /> (normal navigation)
```

### 7. Settings (`settingsStore.ts` + `(tabs)/settings.tsx`)

| Setting | Default | Description |
|---|---|---|
| `retentionDays` | 30 | How long confirmed trash is kept (7, 14, or 30) |
| `incognito` | false | Don't track stats for current session |
| `theme` | 'system' | light / dark / system |
| `skipCloudOnly` | false | Hide iCloud-only photos during review |
| `autoSkip.hidden` | true | Auto-skip hidden album photos |
| `onboarded` | false | Has user completed onboarding |

### 8. Stats (`statsStore.ts` + `StatsDashboard.tsx`)

Tracks aggregate metrics (persisted):
- `totalFreedBytes` — sum of bytes from successfully deleted photos
- `photosReviewed` — total swipe decisions made
- `favoritesCount` — photos marked FAVORITE
- `sessionsCompleted` — completed review sessions

Stats are **not tracked** when session has `incognito: true`.

---

## Data Flow Diagram (Single Review Cycle)

```
┌─────────────┐     createSession()      ┌──────────────┐
│  Home Tab   │ ──────────────────────→  │  Session     │
│  home.tsx   │                          │  [sessionId] │
└─────────────┘                          └──────┬───────┘
                                                │
                                          useSessionQueue()
                                          loads from MediaLibrary
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │    SwipeStack          │
                                    │    ┌─────────────┐     │
                                    │    │  SwipeCard   │←────── useSwipeGestures()
                                    │    │  (top card)  │     │    classifySwipe()
                                    │    └──────┬──────┘     │
                                    └───────────┼────────────┘
                                                │
                                    onSwipeComplete(decision, asset)
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                      recordDecision()    addStaged()      incrementReviewed()
                      (sessionStore)     (trashStore)       (statsStore)
                              │                 │
                              │                 ▼
                              │         /session/review
                              │         (ReviewGrid — select items)
                              │                 │
                              │                 ▼
                              │         /session/confirm
                              │         (ConfirmModal)
                              │                 │
                              │     DeletionService.confirmStaged()
                              │                 │
                              ▼                 ▼
                      completeSession()   confirmStaged(retentionDays)
                                                │
                                    staged → confirmed[] with expiresAt
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                            Auto (retention)         Manual (Trash tab)
                            retentionScheduler       "Delete Now" / "Empty All"
                                    │                       │
                                    └───────────┬───────────┘
                                                ▼
                                  DeletionService.executeDelete()
                                                │
                                  expo-media-library.deleteAssetsAsync()
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                               Success                   Failed
                          removeConfirmed()         addFailedDeletions()
                          addFreedBytes()           Alert user
```

---

## Key Design Decisions

1. **Staged → Confirmed → Deleted pipeline** — No photo is ever deleted on swipe. There are always at least two confirmation steps before OS deletion.

2. **MMKV over AsyncStorage** — Synchronous reads, encrypted storage, debounced writes for high-frequency session updates (250ms for session store).

3. **Zustand over Redux** — Lightweight, no boilerplate, first-class persist middleware, direct store access outside React (e.g., `useTrashStore.getState()` in services).

4. **Crash recovery** — `CrashRecoveryGate` checks for incomplete sessions on launch and offers to resume, preventing data loss.

5. **Incognito mode** — Sessions can opt out of stats tracking for privacy.

6. **Batch deletion with fallback** — Deletes in batches of 200. If a batch fails, retries each item individually to maximize successful deletions.

7. **Retention-based auto-delete** — Items in confirmed trash auto-expire after the configured retention period, checked on every app foreground event.
