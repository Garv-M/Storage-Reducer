// User-facing copy for photo-library permission requests and recovery guidance.
// Keeping strings centralized ensures consistent messaging across onboarding screens.

// ── Permission messaging ───────────────────────────────────────────────────────

/**
 * Text bundle shown when the app needs media-library access to run review flows.
 */
export const PHOTO_PERMISSION_MESSAGE = {
  title: 'Photo Access Required',
  body: 'Storage Reducer needs access to your photo library so you can review and stage cleanup safely.',
  ctaAllow: 'Allow Photo Access',
  ctaSettings: 'Open Settings',
  deniedHelp: 'You can grant permissions later from device settings.',
} as const;
