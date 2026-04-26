// Cross-platform runtime helpers for OS checks and screen sizing.
// Values are computed once per module load for lightweight access in UI logic.

import { Dimensions, Platform } from 'react-native';

// ── Platform snapshot ──────────────────────────────────────────────────────────

/** Initial window dimensions captured at startup for layout defaults. */
const windowDimensions = Dimensions.get('window');

/** True when running on iOS-specific runtime behavior paths. */
export const isIOS = Platform.OS === 'ios';

/** True when running on Android-specific runtime behavior paths. */
export const isAndroid = Platform.OS === 'android';

/** Current window width used by gesture and card-layout calculations. */
export const screenWidth = windowDimensions.width;

/** Current window height used by viewport-dependent UI sizing. */
export const screenHeight = windowDimensions.height;
